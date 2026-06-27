const chart = document.querySelector("#espresso-chart");
const ctx = chart.getContext("2d");
const form = document.querySelector("#espresso-form");
const extractedInput = document.querySelector("#extracted-weight");
const coffeeInput = document.querySelector("#coffee-weight");
const tdsInput = document.querySelector("#tds-percentage");
const tdsResult = document.querySelector("#tds-result");
const yieldResult = document.querySelector("#yield-result");
const resultLabel = document.querySelector("#result-label");
const formMessage = document.querySelector("#form-message");
const logBody = document.querySelector("#log-body");
const emptyLog = document.querySelector("#empty-log");

const bounds = {
  xMin: 14,
  xMax: 26,
  yMin: 3,
  yMax: 15
};

let activePoint = null;
let logs = [];

function calculateTdsAndYield(extractedWeight, coffeeWeight, tdsPercentage) {
  const tds = tdsPercentage / 100;
  const tdsWeight = tds * extractedWeight;
  const yieldPercentage = coffeeWeight > 0 ? (tdsWeight / coffeeWeight) * 100 : 0;
  return { tds, yieldPercentage };
}

function classifyEspresso(tds, yieldPercentage) {
  const strength = tds > 10.5 ? "농도가 진한 커피" : tds < 6.5 ? "농도가 연한 커피" : "농도가 적정한 커피";
  const extraction = yieldPercentage < 18 ? "과소 추출" : yieldPercentage > 22 ? "과다 추출" : "이상적인 추출";
  if (tds > 10.5 && yieldPercentage >= 18 && yieldPercentage <= 22) return "리스트레또 성향";
  if (tds < 6.5 && yieldPercentage >= 18 && yieldPercentage <= 22) return "룽고 성향";
  if (tds >= 6.5 && tds <= 10.5 && yieldPercentage >= 18 && yieldPercentage <= 22) return "이상적인 에스프레소";
  return `${strength} · ${extraction}`;
}

function formatNumber(value, digits = 1) {
  return Number(value).toLocaleString("ko-KR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  });
}

function setMessage(message) {
  formMessage.textContent = message;
}

function resizeCanvas() {
  const rect = chart.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  chart.width = Math.max(1, Math.round(rect.width * dpr));
  chart.height = Math.max(1, Math.round(rect.height * dpr));
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  drawChart();
}

function drawRoundedLabel(text, x, y, align = "center") {
  const lines = text.split("\n");
  ctx.font = "700 13px Malgun Gothic, Apple SD Gothic Neo, sans-serif";
  const width = Math.max(...lines.map((line) => ctx.measureText(line).width)) + 22;
  const height = lines.length * 18 + 14;
  const left = align === "left" ? x : align === "right" ? x - width : x - width / 2;
  const top = y - height / 2;
  ctx.fillStyle = "rgba(246, 236, 212, 0.72)";
  ctx.strokeStyle = "rgba(216, 164, 93, 0.24)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(left, top, width, height, 8);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#334039";
  ctx.textAlign = align;
  ctx.textBaseline = "middle";
  const textX = align === "left" ? left + 11 : align === "right" ? left + width - 11 : left + width / 2;
  lines.forEach((line, index) => {
    ctx.fillText(line, textX, top + 16 + index * 18);
  });
}

function drawChart() {
  const rect = chart.getBoundingClientRect();
  const width = rect.width;
  const height = rect.height;
  if (!width || !height) return;
  ctx.clearRect(0, 0, width, height);

  const left = width < 520 ? 52 : 70;
  const right = 28;
  const top = 28;
  const bottom = 58;
  const plotW = width - left - right;
  const plotH = height - top - bottom;

  const xToPx = (x) => left + ((x - bounds.xMin) / (bounds.xMax - bounds.xMin)) * plotW;
  const yToPx = (y) => top + ((bounds.yMax - y) / (bounds.yMax - bounds.yMin)) * plotH;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "rgba(190, 190, 190, 0.45)";
  ctx.fillRect(xToPx(18), yToPx(15), xToPx(22) - xToPx(18), yToPx(3) - yToPx(15));

  ctx.fillStyle = "rgba(173, 216, 230, 0.45)";
  ctx.fillRect(xToPx(14), yToPx(10.5), xToPx(26) - xToPx(14), yToPx(6.5) - yToPx(10.5));

  ctx.strokeStyle = "#e9ede8";
  ctx.lineWidth = 1;
  ctx.font = "12px Malgun Gothic, Apple SD Gothic Neo, sans-serif";
  ctx.fillStyle = "#68706b";
  ctx.textBaseline = "middle";
  for (let x = bounds.xMin; x <= bounds.xMax; x += 1) {
    const px = xToPx(x);
    ctx.beginPath();
    ctx.moveTo(px, top);
    ctx.lineTo(px, top + plotH);
    ctx.stroke();
    ctx.textAlign = "center";
    ctx.fillText(String(x), px, top + plotH + 22);
  }
  for (let y = bounds.yMin; y <= bounds.yMax + 0.001; y += 0.5) {
    const py = yToPx(y);
    const major = Math.abs(y - Math.round(y)) < 0.001;
    if (major) {
      ctx.beginPath();
      ctx.moveTo(left, py);
      ctx.lineTo(left + plotW, py);
      ctx.stroke();
      ctx.textAlign = "right";
      ctx.fillText(y.toFixed(1), left - 8, py);
    }
  }

  ctx.strokeStyle = "#1f2421";
  ctx.lineWidth = 1.4;
  ctx.strokeRect(left, top, plotW, plotH);

  drawRoundedLabel("농도가 진한 커피\n★리스트레또★", xToPx(20), yToPx(13.8));
  drawRoundedLabel("농도가 진한 커피\n과소 추출", xToPx(14.6), yToPx(13.8), "left");
  drawRoundedLabel("농도가 진한 커피\n과다 추출", xToPx(25.4), yToPx(13.8), "right");
  drawRoundedLabel("이상적인 추출\n★에스프레소★", xToPx(20), yToPx(9));
  drawRoundedLabel("과소 추출", xToPx(14.6), yToPx(9.6), "left");
  drawRoundedLabel("과다 추출", xToPx(25.4), yToPx(9.6), "right");
  drawRoundedLabel("농도가 연한 커피\n과소 추출", xToPx(14.6), yToPx(4.3), "left");
  drawRoundedLabel("농도가 연한 커피\n★룽고★", xToPx(20), yToPx(4.3));
  drawRoundedLabel("농도가 연한 커피\n과다 추출", xToPx(25.4), yToPx(5.5), "right");

  ctx.fillStyle = "#1f2421";
  ctx.font = "700 15px Malgun Gothic, Apple SD Gothic Neo, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("추출 수율 (%)", left + plotW / 2, height - 15);
  ctx.save();
  ctx.translate(18, top + plotH / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText("TDS (%)", 0, 0);
  ctx.restore();

  ctx.font = "800 18px Malgun Gothic, Apple SD Gothic Neo, sans-serif";
  ctx.fillText("에스프레소 컨트롤 차트", left + plotW / 2, 14);

  if (activePoint) {
    const pointX = Math.min(bounds.xMax, Math.max(bounds.xMin, activePoint.yieldPercentage));
    const pointY = Math.min(bounds.yMax, Math.max(bounds.yMin, activePoint.tdsPercentage));
    const px = xToPx(pointX);
    const py = yToPx(pointY);

    ctx.setLineDash([6, 5]);
    ctx.strokeStyle = "#2873b8";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(left, py);
    ctx.lineTo(left + plotW, py);
    ctx.stroke();

    ctx.strokeStyle = "#155d3d";
    ctx.beginPath();
    ctx.moveTo(px, top);
    ctx.lineTo(px, top + plotH);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = "#155d3d";
    ctx.beginPath();
    ctx.arc(px, py, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#155d3d";
    ctx.font = "800 13px Malgun Gothic, Apple SD Gothic Neo, sans-serif";
    ctx.textAlign = px > left + plotW - 120 ? "right" : "left";
    ctx.fillText(`수율 ${activePoint.yieldPercentage.toFixed(1)}% / TDS ${activePoint.tdsPercentage.toFixed(2)}%`, px + (ctx.textAlign === "left" ? 10 : -10), py - 14);
  }
}

function updateResults(point) {
  tdsResult.textContent = `${point.tdsPercentage.toFixed(2)}%`;
  yieldResult.textContent = `${point.yieldPercentage.toFixed(1)}%`;
  resultLabel.textContent = classifyEspresso(point.tdsPercentage, point.yieldPercentage);
}

function renderLogs() {
  logBody.innerHTML = "";
  logs.forEach((log, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${formatNumber(log.extractedWeight, 2)}g</td>
      <td>${formatNumber(log.coffeeWeight, 2)}g</td>
      <td>${formatNumber(log.tdsPercentage, 2)}%</td>
      <td>${formatNumber(log.yieldPercentage, 1)}%</td>
      <td>${log.label}</td>
      <td><button class="load-log" type="button" data-index="${index}">입력</button></td>
    `;
    logBody.appendChild(tr);
  });
  emptyLog.hidden = logs.length > 0;
  document.querySelectorAll(".load-log").forEach((button) => {
    button.addEventListener("click", () => {
      const log = logs[Number(button.dataset.index)];
      extractedInput.value = log.extractedWeight;
      coffeeInput.value = log.coffeeWeight;
      tdsInput.value = log.tdsPercentage;
      activePoint = log;
      updateResults(log);
      drawChart();
      setMessage("");
    });
  });
}

function addLog(point) {
  logs.unshift(point);
  renderLogs();
}

function handleSubmit(event) {
  event.preventDefault();
  const extractedWeight = Number(extractedInput.value);
  const coffeeWeight = Number(coffeeInput.value);
  const tdsPercentage = Number(tdsInput.value);

  if (!Number.isFinite(extractedWeight) || !Number.isFinite(coffeeWeight) || !Number.isFinite(tdsPercentage) || extractedWeight <= 0 || coffeeWeight <= 0 || tdsPercentage <= 0) {
    setMessage("데이터가 없거나 숫자 및 소숫점 숫자가 입력되지 않았습니다.");
    return;
  }

  const { yieldPercentage } = calculateTdsAndYield(extractedWeight, coffeeWeight, tdsPercentage);
  const point = {
    extractedWeight,
    coffeeWeight,
    tdsPercentage,
    yieldPercentage,
    label: classifyEspresso(tdsPercentage, yieldPercentage)
  };

  activePoint = point;
  updateResults(point);
  addLog(point);
  drawChart();
  form.reset();
  setMessage("");
}

function downloadCsv() {
  if (!logs.length) {
    setMessage("저장할 측정 기록이 없습니다.");
    return;
  }
  const header = ["추출된 커피 용량", "사용한 원두 용량", "TDS", "추출 수율", "판정"];
  const rows = logs.map((log) => [
    log.extractedWeight,
    log.coffeeWeight,
    log.tdsPercentage,
    log.yieldPercentage.toFixed(4),
    log.label
  ]);
  const csv = [header, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([`\ufeff${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "에스프레소_컨트롤_로그.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  setMessage("");
}

form.addEventListener("submit", handleSubmit);
document.querySelector("#clear-inputs").addEventListener("click", () => {
  form.reset();
  setMessage("");
});
document.querySelector("#clear-log").addEventListener("click", () => {
  logs = [];
  renderLogs();
  setMessage("");
});
document.querySelector("#download-log").addEventListener("click", downloadCsv);
window.addEventListener("resize", resizeCanvas);

renderLogs();
resizeCanvas();
