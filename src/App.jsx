import React, { useMemo, useState } from "react";
import { MODEL } from "./modelData";
import { DEFAULT_STATE, calculate } from "./model";
import "./styles.css";

const fmt = (value) => Number(value ?? 0).toFixed(3).replace(".", ",");
const clamp = (value, min, max) => Math.min(max, Math.max(min, Number.isFinite(value) ? value : 0));

function NumberField({ value, onChange, step = "0.01", min, max, title }) {
  return (
    <input
      aria-label={title}
      title={title}
      type="number"
      value={value}
      step={step}
      min={min}
      max={max}
      onChange={(event) => onChange(Number(event.target.value))}
    />
  );
}

function smoothPath(values, x, y) {
  if (!values.length) return "";

  const points = values.map((value, i) => ({
    x: x(i),
    y: y(value),
  }));

  if (points.length === 1) {
    return `M ${points[0].x} ${points[0].y}`;
  }

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;

    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }

  return path;
}


function LineChart({ rows }) {
  const W = 900;
  const H = 390;
  const L = 58;
  const R = 18;
  const T = 22;
  const B = 45;

  const all = rows.flatMap((row) => [
    ...row.x,
    ...row.X,
    row.P,
  ]);

  const dataMin = Math.min(...all);
  const dataMax = Math.max(...all);

  // Автоматическое масштабирование оси Y
  const dataRange = dataMax - dataMin;
  const pad = Math.max(dataRange * 0.18, 0.005);

  const ymin = dataMin - pad;
  const ymax = dataMax + pad;

  const xx = (i) =>
    L + (i / Math.max(1, rows.length - 1)) * (W - L - R);

  const yy = (value) =>
    T + ((ymax - value) / (ymax - ymin)) * (H - T - B);

  const colors = Array.from(
    { length: 27 },
    (_, i) => `hsl(${(i * 47 + 8) % 360} 62% 43%)`
  );

  const series = MODEL.indicators.map((item, i) => ({
    name: `x${item.id}`,
    values: rows.map((row) => row.x[i]),
    color: colors[i],
    width: 1.5,
  }));

  MODEL.groups.forEach((group, i) => {
    series.push({
      name: group.id,
      values: rows.map((row) => row.X[i]),
      color: ["#1d70a2", "#e18a24", "#29865a", "#9b58a5"][i],
      width: 2.8,
    });
  });

  series.push({
    name: "P",
    values: rows.map((row) => row.P),
    color: "#171717",
    width: 3.5,
  });

  return (
    <>
      <div className="chart-scroll">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="line-chart"
          role="img"
          aria-label="Нелинейный график изменения показателей во времени"
        >
          {/* Горизонтальная сетка */}
          {Array.from({ length: 7 }, (_, i) => {
            const value = ymin + ((ymax - ymin) * i) / 6;

            return (
              <g key={i}>
                <line
                  x1={L}
                  x2={W - R}
                  y1={yy(value)}
                  y2={yy(value)}
                  stroke="#e5e8eb"
                  strokeDasharray="3 4"
                />
                <text
                  x={L - 9}
                  y={yy(value) + 4}
                  textAnchor="end"
                >
                  {value.toFixed(3)}
                </text>
              </g>
            );
          })}

          {/* Оси */}
          <line
            x1={L}
            x2={W - R}
            y1={H - B}
            y2={H - B}
            stroke="#7d8790"
          />

          <line
            x1={L}
            x2={L}
            y1={T}
            y2={H - B}
            stroke="#7d8790"
          />

          {/* Подписи времени */}
          {[0, 0.2, 0.4, 0.6, 0.8, 1].map(
            (fraction, i) => (
              <text
                key={i}
                x={L + fraction * (W - L - R)}
                y={H - 13}
                textAnchor="middle"
              >
                {(rows.at(-1).t * fraction).toFixed(2)}
              </text>
            )
          )}

          {/* Линии показателей */}
          {series.map((item) => (
            <path
              key={item.name}
              d={smoothPath(item.values, xx, yy)}
              fill="none"
              stroke={item.color}
              strokeWidth={item.width}
              opacity={item.name === "P" ? 1 : 0.85}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          ))}
        </svg>
      </div>

      <div className="chart-axis-label">
        Время t
      </div>

      <div className="legend-grid">
        {series.map((item) => (
          <span key={item.name}>
            <i
              style={{
                background: item.color,
                height: item.width + 1,
              }}
            />
            {item.name}
          </span>
        ))}
      </div>
    </>
  );
}



function RadarChart({ row, initialRow }) {
  const size = 280;
  const cx = 140;
  const cy = 137;
  const radius = 92;
  const count = 27;

  // Усиление визуального отображения изменений.
  // На реальные расчётные значения не влияет.
  const VISUAL_GAIN = 8;

  const point = (i, value) => {
    const angle =
      -Math.PI / 2 + (i * 2 * Math.PI) / count;

    const r = radius * clamp(value, 0, 1);

    return [
      cx + r * Math.cos(angle),
      cy + r * Math.sin(angle),
    ];
  };

  const polygonPoints = (values) =>
    values
      .map((value, i) => point(i, value).join(","))
      .join(" ");

  // Усиленное отображение отклонения от начального профиля
  const visualValues = row.x.map((value, i) => {
    const initial = initialRow.x[i];
    const difference = value - initial;

    return clamp(
      initial + difference * VISUAL_GAIN,
      0,
      1
    );
  });

  const changedCount = row.x.filter(
    (value, i) =>
      Math.abs(value - initialRow.x[i]) > 0.000001
  ).length;

  const maxDifference = Math.max(
    ...row.x.map((value, i) =>
      Math.abs(value - initialRow.x[i])
    )
  );

  return (
    <div className="radar-card">
      <div className="radar-title">
        t = {fmt(row.t)}
      </div>

      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="radar"
        aria-label={`Лепестковая диаграмма в момент времени ${row.t}`}
      >
        {/* Концентрические окружности */}
        {[0.25, 0.5, 0.75, 1].map((level) => (
          <polygon
            key={level}
            points={Array.from(
              { length: count },
              (_, i) => point(i, level).join(",")
            ).join(" ")}
            fill="none"
            stroke="#d9dee4"
            strokeWidth="0.8"
          />
        ))}

        {/* Оси и номера показателей */}
        {Array.from({ length: count }, (_, i) => {
          const [x, y] = point(i, 1);
          const [tx, ty] = point(i, 1.14);

          return (
            <g key={i}>
              <line
                x1={cx}
                y1={cy}
                x2={x}
                y2={y}
                stroke="#e2e6eb"
                strokeWidth="0.7"
              />

              <text
                x={tx}
                y={ty}
                textAnchor="middle"
                dominantBaseline="middle"
                className="radar-label"
              >
                {i + 1}
              </text>
            </g>
          );
        })}

        {/* Начальный профиль — красный силуэт */}
        <polygon
          points={polygonPoints(initialRow.x)}
          fill="#e33434"
          fillOpacity="0.06"
          stroke="#e33434"
          strokeWidth="3"
          strokeLinejoin="round"
        />

        {/* Текущий профиль — синий силуэт */}
        <polygon
          points={polygonPoints(visualValues)}
          fill="#527fd0"
          fillOpacity="0.38"
          stroke="#174db5"
          strokeWidth="2.8"
          strokeLinejoin="round"
        />

        {/* Маркеры текущих значений */}
        {visualValues.map((value, i) => {
          const [x, y] = point(i, value);

          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="2.2"
              fill="#174db5"
              stroke="white"
              strokeWidth="0.7"
            />
          );
        })}
      </svg>

      <div className="radar-caption">
        x₁–x₂₇ · нормированные значения
      </div>

      <div className="radar-difference">
        <span>
          Изменилось показателей: <b>{changedCount}</b>
        </span>
        <span>
          Максимальное Δ: <b>{fmt(maxDifference)}</b>
        </span>
      </div>
    </div>
  );
}


export default function App() {
  const [state, setState] = useState(DEFAULT_STATE);
  const [tab, setTab] = useState("input");
  const [rows, setRows] = useState(null);
  const [equationDetails, setEquationDetails] = useState([]);
  const [showFunctions, setShowFunctions] = useState(true);

  const setValue = (key, value) => setState((previous) => ({ ...previous, [key]: value }));
  const setArrayItem = (key, index, field, value) => setState((previous) => ({
    ...previous,
    [key]: previous[key].map((item, i) => i === index ? { ...item, [field]: value } : item),
  }));

  const randomize = () => {
    setState((previous) => ({
      ...previous,
      x: previous.x.map(() => Number((0.1 + Math.random() * 0.9).toFixed(2))),
      max: previous.max.map(() => 1),
      z: previous.z.map(() => ({
        m: Number((0.5 + Math.random() * 1.5).toFixed(2)),
        b: Number((Math.random() * 0.8).toFixed(2)),
        g: Number((Math.random() * 0.03).toFixed(3)),
      })),
      functions: previous.functions.map(() => ({
        a: Number((-0.5 + Math.random()).toFixed(2)),
        b: Number((-0.5 + Math.random()).toFixed(2)),
        c: Number((0.2 + Math.random() * 1.1).toFixed(2)),
        d: Number((-0.15 + Math.random() * 0.3).toFixed(2)),
      })),
    }));
    setRows(null);
    setTab("input");
  };

  const run = () => {
    const result = calculate(state);

    setRows(result.rows);
    setEquationDetails(result.equations);

    setTab("result");
  };

  const radarRows = useMemo(() => {
    if (!rows) return [];
    return Array.from({ length: 6 }, (_, i) => {
      const target = (rows.at(-1).t * i) / 5;
      return rows.reduce((best, row) => Math.abs(row.t - target) < Math.abs(best.t - target) ? row : best, rows[0]);
    });
  }, [rows]);

  return (
    <main className="app">
      <header className="topbar">
        <div className="topbar-main">
          <div className="eyebrow">МАТЕМАТИЧЕСКАЯ МОДЕЛЬ · 27 ПОКАЗАТЕЛЕЙ</div>
          <h1>Оценка практичности программного обеспечения</h1>
          <p>Практичность ПО — способность программного продукта быть понятным, удобным, легко изучаемым и привлекательным для пользователя при применении в заданных условиях.</p>
          <div className="model-description">
            <b>Структура модели:</b> 27 частных показателей объединены в 4 компонента: X₁ — понятность (x₁–x₇), X₂ — удобство использования (x₈–x₁₄), X₃ — изучаемость (x₁₅–x₂₀), X₄ — привлекательность (x₂₁–x₂₇). Итоговая оценка P рассчитывается как среднее четырёх компонентов; в системе учитываются возмущения z₁–z₅. Для частных показателей используется полиномиальная зависимость fᵢ(x) = aᵢx³ + bᵢx² + cᵢx + dᵢ. Динамика рассчитывается методом Рунге — Кутты 4-го порядка.
          </div>
        </div>
        <div className="top-stats"><span><b>27</b> показателей</span><span><b>4</b> компонента</span><span><b>5</b> возмущений</span></div>
      </header>

      <nav className="tabs">
        <button
          className={tab === "input" ? "active" : ""}
          onClick={() => setTab("input")}
        >
          Исходные данные
        </button>

        <button
          disabled={!rows}
          className={tab === "result" ? "active" : ""}
          onClick={() => setTab("result")}
        >
          Полученный результат
        </button>

        <button
          disabled={!rows}
          className={tab === "equations" ? "active" : ""}
          onClick={() => setTab("equations")}
        >
          Уравнения модели
        </button>
      </nav>

      {tab === "input" && <>
        <div className="input-grid">
          <section className="data-panel indicators-panel">
            <div className="panel-heading blue"><h2>Исследуемые показатели</h2></div>
            <div className="indicator-table-wrap">
              <table className="indicator-table">
                <thead><tr><th>Название параметра</th><th>Значение</th><th>Предел</th><th>Норм. значение</th></tr></thead>
                <tbody>{MODEL.indicators.map((item, i) => <tr key={item.id}>
                  <td><b>x{item.id}</b><span>{item.name}</span></td>
                  <td><NumberField title={`Значение x${item.id}`} value={state.x[i]} min="0" onChange={(value) => setValue("x", state.x.map((v, j) => j === i ? Math.max(0, value) : v))} /></td>
                  <td><NumberField title={`Предел x${item.id}`} value={state.max[i]} min="0.000001" onChange={(value) => setValue("max", state.max.map((v, j) => j === i ? Math.max(0.000001, value) : v))} /></td>
                  <td className="norm-value">{fmt(clamp(state.x[i] / Math.max(state.max[i], 1e-9), 0, 1))}</td>
                </tr>)}</tbody>
              </table>
            </div>
          </section>

          <section className="data-panel disturbance-panel">
            <div className="panel-heading blue"><h2>Возмущения</h2></div>
            <div className="disturbance-list">
              {MODEL.disturbances.map((disturbance, i) => <div className="disturbance" key={disturbance.id}>
                <div className="disturbance-name"><b>z<sub>{i + 1}</sub>(t) = (b<sub>{i + 1}</sub> + 100·g<sub>{i + 1}</sub>·t) / m<sub>{i + 1}</sub></b><span>{disturbance.name}</span></div>
                <div className="disturbance-fields">
                  {(["m", "b", "g"]).map((field) => <label key={field}><span>{field}<sub>{i + 1}</sub></span><NumberField title={`${field}${i + 1}`} value={state.z[i][field]} min={field === "m" ? "0.000001" : undefined} onChange={(value) => setArrayItem("z", i, field, field === "m" ? Math.max(0.000001, value) : value)} /></label>)}
                </div>
              </div>)}
            </div>
            <div className="disturbance-foot">Параметры m, b и g задают изменение каждого возмущения во времени.</div>
          </section>

          <section className="data-panel functions-panel">
            <div className="panel-heading blue function-heading"><h2>Коэффициенты функций</h2><button onClick={() => setShowFunctions(!showFunctions)}>{showFunctions ? "Свернуть" : "Развернуть"}</button></div>
            {showFunctions && <>
              <div className="function-hint">fᵢ(x) = aᵢ·x³ + bᵢ·x² + cᵢ·x + dᵢ</div>
              <div className="function-list">{state.functions.map((params, i) => <div className="function-row" key={i}>
                <b>f<sub>{i + 1}</sub>(x) =</b>
                {(["a", "b", "c", "d"]).map((field, index) => <React.Fragment key={field}>
                  <label className="coefficient-field"><span>{field}<sub>{i + 1}</sub></span><NumberField title={`${field}${i + 1}`} value={params[field]} step="0.01" onChange={(value) => setArrayItem("functions", i, field, value)} /></label>
                  {index < 3 && <span className="poly-term">{["x³ +", "x² +", "x +"][index]}</span>}
                </React.Fragment>)}
              </div>)}</div>
            </>}
          </section>
        </div>

        <div className="bottom-controls">
          <button onClick={randomize}>Заполнить случайными значениями</button>
          <button className="calculate-button" onClick={run}>Вычислить результат</button>
        </div>
        <section className="time-settings">
          <b>Параметры интегрирования</b>
          <label>Конечное время T <NumberField value={state.duration} min="0.02" step="0.1" onChange={(value) => setValue("duration", Math.max(0.02, value))} /></label>
          <label>Шаг h <NumberField value={state.step} min="0.001" max="0.1" step="0.005" onChange={(value) => setValue("step", clamp(value, 0.001, 0.1))} /></label>
          <button onClick={() => { setState(DEFAULT_STATE); setRows(null); }}>Сбросить</button>
        </section>
      </>}

      {tab === "result" && rows && <div className="results-page">
        <div className="result-title"><div><div className="eyebrow">РЕЗУЛЬТАТ МОДЕЛИРОВАНИЯ</div><h2>Полученный результат</h2><p>Нелинейная динамика изменения показателей и их распределение в контрольные моменты времени</p></div></div>
        <div className="result-grid">
          <section className="result-panel"><h3>График изменения показателей во времени</h3><LineChart rows={rows} /></section>
          <section className="result-panel radar-results">
            <h3>Лепестковые диаграммы</h3>
            <div className="radar-grid">{radarRows.map((row, i) => <RadarChart row={row} initialRow={rows[0]} key={i} />)}</div>
            <div className="radar-legend"><span><i className="blue-dot" /> Текущие значения</span><span><i className="red-line" /> Начальный профиль (t = 0)</span></div>
          </section>
        </div>
        <section className="result-panel summary-panel">
          <h3>Итоговые значения при t = {fmt(rows.at(-1).t)}</h3>
          <div className="summary-values">
            <div className="summary-main"><span>Практичность ПО · P</span><b>{fmt(rows.at(-1).P)}</b></div>
            {MODEL.groups.map((group, i) => <div key={group.id}><span>{group.id} · {group.name}</span><b>{fmt(rows.at(-1).X[i])}</b></div>)}
          </div>
          <h3>Значения показателей x₁–x₂₇</h3>
          <div className="value-grid">{MODEL.indicators.map((item, i) => <div key={item.id}><b>x{item.id}</b><span>{item.name}</span><strong>{fmt(rows.at(-1).x[i])}</strong></div>)}</div>
        </section>
      </div>}

      {tab === "equations" && rows && (
        <div className="equations-page">
          <div className="result-title">
            <div>
              <div className="eyebrow">
                МАТЕМАТИЧЕСКОЕ ОПИСАНИЕ
              </div>

              <h2>Система дифференциальных уравнений</h2>

              <p>
                Уравнения с подставленными параметрами исходных данных.
                Значения и производные рассчитаны для начального момента времени t = 0.
              </p>
            </div>
          </div>

          <section className="equation-method">
            <h3>Используемая модель</h3>

            <p>
              Для каждого показателя используется уравнение:
            </p>

            <div className="equation-formula">
              dxᵢ/dt = (0.1 / mᵢ) · fₐ(xᵢ) · fᵦ(Xₖ) · f꜀(x̄) · Dᵢ(t)
              + 0.35 · xᵢ · (1 − xᵢ) · (0.5 − xᵢ)
            </div>

            <p>
              Здесь Dᵢ(t) — сумма воздействий возмущений,
              x̄ — среднее значение двух соседних показателей.
              Второе слагаемое представляет нелинейную обратную связь.
            </p>

            <p>
              Численное интегрирование выполняется методом
              Рунге — Кутты 4-го порядка.
            </p>
          </section>

          <div className="equation-count">
            Всего уравнений: <b>{equationDetails.length}</b>
          </div>

          <div className="equation-list">
            {equationDetails.map((item) => (
              <section className="equation-card" key={item.id}>
                <div className="equation-card-header">
                  <div>
                    <h3>
                      dx{item.id}/dt — x{item.id}
                    </h3>
                    <p>{item.name}</p>
                  </div>

                  <div className="equation-derivative">
                    <span>Производная при t = 0</span>
                    <b>{fmt(item.derivative)}</b>
                  </div>
                </div>

                <div className="equation-section">
                  <b>1. Исходное уравнение</b>
                  <div className="equation-expression">
                    {item.equationText}
                  </div>
                </div>

                <div className="equation-section">
                  <b>2. Подстановка коэффициентов функций</b>

                  {item.functions.map((functionId, index) => {
                    const params = state.functions[functionId - 1];

                    return (
                      <div className="function-substitution" key={index}>
                        <span>f{functionId}(x)</span>

                        <code>
                          {params.a}x³ + {params.b}x² + {params.c}x + {params.d}
                        </code>

                        <span>
                          = {fmt(item.functionValues[index])}
                        </span>

                        <div className="equation-small">
                          Подстановка аргумента: {item.functionTexts[index]}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="equation-section">
                  <b>3. Подставленные значения показателей</b>

                  <div className="equation-values">
                    <span>
                      x{item.id} = <b>{fmt(item.currentX)}</b>
                    </span>

                    <span>
                      {item.component} = <b>{fmt(rows[0].X[
                        Number(item.component.slice(1)) - 1
                      ])}</b>
                    </span>

                    <span>
                      x{item.left} = <b>{fmt(rows[0].x[item.left - 1])}</b>
                    </span>

                    <span>
                      x{item.right} = <b>{fmt(rows[0].x[item.right - 1])}</b>
                    </span>

                    <span>
                      Среднее соседей = <b>{fmt(item.neighborMean)}</b>
                    </span>

                    <span>
                      Предел mᵢ = <b>{fmt(item.max)}</b>
                    </span>
                  </div>
                </div>

                <div className="equation-section">
                  <b>4. Подстановка возмущений</b>

                  {item.disturbanceTerms.length > 0 ? (
                    <div className="equation-expression">
                      {item.disturbanceTerms.join(" ")}
                    </div>
                  ) : (
                    <div className="equation-expression">
                      Возмущения в данном уравнении отсутствуют.
                    </div>
                  )}

                  <p>
                    Суммарное воздействие Dᵢ(0) ={" "}
                    <b>{fmt(item.disturbance)}</b>
                  </p>
                </div>

                <div className="equation-section">
                  <b>5. Полная подстановка</b>

                  <div className="equation-expression">
                    {item.substitutedText}
                  </div>
                </div>

                <div className="equation-calculation">
                  <div>
                    Внешнее воздействие:
                    <b>{fmt(item.externalInfluence)}</b>
                  </div>

                  <div>
                    Нелинейная обратная связь:
                    <b>{fmt(item.nonlinear)}</b>
                  </div>

                  <div className="equation-final">
                    dx{item.id}/dt =
                    <b>{fmt(item.derivative)}</b>
                  </div>
                </div>
              </section>
            ))}
          </div>
        </div>
      )}

      <footer>Калькулятор практичности программного обеспечения · React · GitHub Pages</footer>
    </main>
  );
}
