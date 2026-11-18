
import { MODEL } from "./modelData";

export const DEFAULT_STATE = {
  x: Array(27).fill(0.6),
  max: Array(27).fill(1),

  z: Array.from({ length: 5 }, () => ({
    m: 1,
    b: 0.15,
    g: 0.01,
  })),

  functions: Array.from({ length: 81 }, () => ({
    a: 0.15,
    b: -0.1,
    c: 0.8,
    d: 0.05,
  })),

  duration: 1,
  step: 0.02,
};

// Коэффициент нелинейной обратной связи.
// Он добавляет зависимость производной от текущего состояния показателя.
const NONLINEAR_GAIN = 0.35;

const clamp = (value) =>
  Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0));

const safe = (value) =>
  Number.isFinite(Number(value)) ? Number(value) : 0;

const fmt = (value) => safe(value).toFixed(5);

const poly = (params, x) =>
  params.a * x ** 3 +
  params.b * x ** 2 +
  params.c * x +
  params.d;

const polynomialText = (params, x) =>
  `(${fmt(params.a)} × ${fmt(x)}³) + ` +
  `(${fmt(params.b)} × ${fmt(x)}²) + ` +
  `(${fmt(params.c)} × ${fmt(x)}) + ` +
  `${fmt(params.d)}`;

const aggregate = (x) =>
  MODEL.groups.map((group) => {
    const values = x.slice(group.start - 1, group.end);

    return (
      values.reduce((sum, value) => sum + value, 0) /
      values.length
    );
  });

// Нормированные значения возмущений
const zAt = (t, params) =>
  params.map((p) =>
    clamp(
      (p.b + p.g * 100 * t) /
      Math.max(p.m, 1e-9)
    )
  );

// Нелинейная обратная связь
function nonlinearPart(x) {
  return (
    NONLINEAR_GAIN *
    x *
    (1 - x) *
    (0.5 - x)
  );
}

// Расчёт правой части системы
function deriv(t, x, state) {
  const X = aggregate(x);
  const z = zAt(t, state.z);

  return MODEL.equations.map((equation, i) => {
    const [fA, fB, fC] = equation.functions.map(
      (number) => state.functions[number - 1]
    );

    const componentIndex =
      Number(equation.component.slice(1)) - 1;

    const component = X[componentIndex];

    const [left, right] = equation.neighbors;

    const neighborMean =
      (x[left - 1] + x[right - 1]) / 2;

    const functionProduct =
      poly(fA, x[i]) *
      poly(fB, component) *
      poly(fC, neighborMean);

    const disturbance = equation.disturbances.reduce(
      (sum, item) =>
        sum + item.sign * z[item.z - 1],
      0
    );

    const externalInfluence =
      (0.1 / Math.max(state.max[i], 1e-9)) *
      functionProduct *
      disturbance;

    const internalInfluence =
      nonlinearPart(x[i]);

    return externalInfluence + internalInfluence;
  });
}

// Формирование подробного описания уравнений
function buildEquationDetails(state, initialX) {
  const X = aggregate(initialX);
  const z = zAt(0, state.z);

  return MODEL.equations.map((equation, i) => {
    const indicator = MODEL.indicators[i];

    const [fA, fB, fC] = equation.functions.map(
      (number) => state.functions[number - 1]
    );

    const componentIndex =
      Number(equation.component.slice(1)) - 1;

    const component = X[componentIndex];

    const [left, right] = equation.neighbors;

    const neighborMean =
      (initialX[left - 1] + initialX[right - 1]) / 2;

    const currentX = initialX[i];

    const functionValues = [
      poly(fA, currentX),
      poly(fB, component),
      poly(fC, neighborMean),
    ];

    const functionTexts = [
      polynomialText(fA, currentX),
      polynomialText(fB, component),
      polynomialText(fC, neighborMean),
    ];

    const disturbanceTerms = equation.disturbances.map(
      (item) => {
        const sign = item.sign >= 0 ? "+" : "−";
        return `${sign} z${item.z} = ${sign} ${fmt(z[item.z - 1])}`;
      }
    );

    const disturbance = equation.disturbances.reduce(
      (sum, item) =>
        sum + item.sign * z[item.z - 1],
      0
    );

    const functionProduct =
      functionValues[0] *
      functionValues[1] *
      functionValues[2];

    const externalInfluence =
      (0.1 / Math.max(state.max[i], 1e-9)) *
      functionProduct *
      disturbance;

    const nonlinear = nonlinearPart(currentX);

    const derivative = externalInfluence + nonlinear;

    return {
      id: i + 1,
      name: indicator?.name ?? `Показатель x${i + 1}`,

      component: equation.component,

      currentX,
      max: state.max[i],

      left,
      right,
      neighborMean,

      functions: equation.functions,
      functionTexts,
      functionValues,

      disturbanceTerms,
      disturbance,

      functionProduct,
      externalInfluence,
      nonlinear,
      derivative,

      equationText:
        `dx${i + 1}/dt = ` +
        `(0.1 / ${fmt(state.max[i])}) × ` +
        `f${equation.functions[0]}(x${i}) × ` +
        `f${equation.functions[1]}(${equation.component}) × ` +
        `f${equation.functions[2]}((x${left} + x${right}) / 2) × ` +
        `(${disturbanceTerms.length ? disturbanceTerms.join(" ") : "0"}) ` +
        `+ ${NONLINEAR_GAIN} × x${i} × (1 − x${i}) × (0.5 − x${i})`,

      substitutedText:
        `(0.1 / ${fmt(state.max[i])}) × ` +
        `(${fmt(functionValues[0])}) × ` +
        `(${fmt(functionValues[1])}) × ` +
        `(${fmt(functionValues[2])}) × ` +
        `(${fmt(disturbance)}) ` +
        `+ ${NONLINEAR_GAIN} × ${fmt(currentX)} × ` +
        `(1 − ${fmt(currentX)}) × (0.5 − ${fmt(currentX)})`,

      values: {
        x: currentX,
        component,
        neighborMean,
        disturbance,
        externalInfluence,
        nonlinear,
        derivative,
      },
    };
  });
}

const add = (x, k, scale) =>
  x.map((value, i) => value + scale * k[i]);

// Основной расчёт
export function calculate(state) {
  const duration = Math.max(
    0.02,
    Number(state.duration)
  );

  const steps = Math.ceil(
    duration /
    Math.max(0.001, Math.min(0.1, Number(state.step)))
  );

  const h = duration / steps;

  let x = state.x.map((value, i) =>
    clamp(
      Number(value) /
      Math.max(state.max[i], 1e-9)
    )
  );

  const equationDetails = buildEquationDetails(state, x);

  let X = aggregate(x);

  const rows = [
    {
      t: 0,
      x: [...x],
      X,
      P: X.reduce((sum, value) => sum + value, 0) / 4,
    },
  ];

  // Интегрирование методом Рунге — Кутты 4-го порядка
  for (let n = 0; n < steps; n += 1) {
    const t = n * h;

    const k1 = deriv(t, x, state);

    const k2 = deriv(
      t + h / 2,
      add(x, k1, h / 2),
      state
    );

    const k3 = deriv(
      t + h / 2,
      add(x, k2, h / 2),
      state
    );

    const k4 = deriv(
      t + h,
      add(x, k3, h),
      state
    );

    x = x.map((value, i) =>
      clamp(
        value +
        (h *
          (k1[i] +
            2 * k2[i] +
            2 * k3[i] +
            k4[i])) /
          6
      )
    );

    if (
      (n + 1) %
        Math.max(1, Math.floor(steps / 100)) ===
        0 ||
      n === steps - 1
    ) {
      X = aggregate(x);

      rows.push({
        t: (n + 1) * h,
        x: [...x],
        X,
        P: X.reduce((sum, value) => sum + value, 0) / 4,
      });
    }
  }

  return {
    rows,
    equations: equationDetails,
  };
}
