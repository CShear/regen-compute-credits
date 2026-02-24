import {
  getAllowedDenoms,
  listCreditClasses,
  listSellOrders,
  type AllowedDenom,
} from "../ledger.js";
import type { BudgetOrderSelection, BudgetSelectedOrder } from "./types.js";

function pickDenom(
  allowedDenoms: AllowedDenom[],
  preferred?: string
): { bankDenom: string; displayDenom: string; exponent: number } {
  if (preferred) {
    const preferredLower = preferred.toLowerCase();
    const match = allowedDenoms.find(
      (d) =>
        d.bank_denom.toLowerCase() === preferredLower ||
        d.display_denom.toLowerCase() === preferredLower
    );
    if (match) {
      return {
        bankDenom: match.bank_denom,
        displayDenom: match.display_denom,
        exponent: match.exponent,
      };
    }
  }

  const regen = allowedDenoms.find(
    (d) => d.display_denom === "REGEN" || d.bank_denom === "uregen"
  );
  if (regen) {
    return {
      bankDenom: regen.bank_denom,
      displayDenom: regen.display_denom,
      exponent: regen.exponent,
    };
  }

  if (allowedDenoms.length > 0) {
    const first = allowedDenoms[0];
    return {
      bankDenom: first.bank_denom,
      displayDenom: first.display_denom,
      exponent: first.exponent,
    };
  }

  return { bankDenom: "uregen", displayDenom: "REGEN", exponent: 6 };
}

function toMicroQuantityString(microQuantity: bigint): string {
  const whole = microQuantity / 1_000_000n;
  const frac = (microQuantity % 1_000_000n).toString().padStart(6, "0");
  return `${whole.toString()}.${frac}`;
}

export async function selectOrdersForBudget(
  creditType: "carbon" | "biodiversity" | undefined,
  budgetMicro: bigint,
  preferredDenom?: string
): Promise<BudgetOrderSelection> {
  if (budgetMicro <= 0n) {
    throw new Error("budgetMicro must be greater than zero");
  }

  const [sellOrders, classes, allowedDenoms] = await Promise.all([
    listSellOrders(),
    listCreditClasses(),
    getAllowedDenoms(),
  ]);

  const classTypeMap = new Map<string, string>();
  for (const cls of classes) {
    classTypeMap.set(cls.id, cls.credit_type_abbrev);
  }

  const denomInfo = pickDenom(allowedDenoms, preferredDenom);

  const eligible = sellOrders.filter((order) => {
    if (order.disable_auto_retire) return false;
    if (order.ask_denom !== denomInfo.bankDenom) return false;

    if (creditType) {
      const classId = order.batch_denom.split("-").slice(0, 1).join("");
      const abbrev = classTypeMap.get(classId);
      if (!abbrev) return false;
      if (creditType === "carbon" && abbrev !== "C") return false;
      if (creditType === "biodiversity" && abbrev === "C") return false;
    }

    if (order.expiration) {
      const expDate = new Date(order.expiration);
      if (expDate <= new Date()) return false;
    }

    return true;
  });

  eligible.sort((a, b) => {
    const aPrice = BigInt(a.ask_amount);
    const bPrice = BigInt(b.ask_amount);
    if (aPrice < bPrice) return -1;
    if (aPrice > bPrice) return 1;
    return 0;
  });

  const MICRO_CREDITS = 1_000_000n;
  let remainingBudget = budgetMicro;
  let totalQuantityMicro = 0n;
  let totalCostMicro = 0n;
  const selected: BudgetSelectedOrder[] = [];

  for (const order of eligible) {
    if (remainingBudget <= 0n) break;

    const available = parseFloat(order.quantity);
    if (!Number.isFinite(available) || available <= 0) continue;

    const availableMicro = BigInt(Math.floor(available * 1_000_000));
    if (availableMicro <= 0n) continue;

    const pricePerCreditMicro = BigInt(order.ask_amount);
    if (pricePerCreditMicro <= 0n) continue;

    const affordableMicro =
      (remainingBudget * MICRO_CREDITS) / pricePerCreditMicro;
    if (affordableMicro <= 0n) continue;

    const takeMicro =
      availableMicro < affordableMicro ? availableMicro : affordableMicro;
    if (takeMicro <= 0n) continue;

    const costMicro =
      (pricePerCreditMicro * takeMicro + MICRO_CREDITS - 1n) / MICRO_CREDITS;
    if (costMicro <= 0n || costMicro > remainingBudget) continue;

    selected.push({
      sellOrderId: order.id,
      batchDenom: order.batch_denom,
      quantity: toMicroQuantityString(takeMicro),
      askAmount: order.ask_amount,
      askDenom: order.ask_denom,
      costMicro,
    });

    totalQuantityMicro += takeMicro;
    totalCostMicro += costMicro;
    remainingBudget -= costMicro;
  }

  return {
    orders: selected,
    totalQuantity: toMicroQuantityString(totalQuantityMicro),
    totalCostMicro,
    remainingBudgetMicro: remainingBudget,
    paymentDenom: denomInfo.bankDenom,
    displayDenom: denomInfo.displayDenom,
    exponent: denomInfo.exponent,
    exhaustedBudget: remainingBudget === 0n,
  };
}
