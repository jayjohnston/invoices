const td = new Date();
let dd = new Date();

// default due date is NET 15
dd.setDate(dd.getDate() + 15);

// TODO: allow an account to set date formatting patterns
const format_date = (dt) => {
  return `${dt.getMonth()+1}/${dt.getDate()}/${dt.getFullYear()}`
}

const format_ymdhis = (dt) => {
  const pad = (i) => (i < 10) ? '0' + i : '' + i;
  return dt.getFullYear() + '-' +
    pad(1 + dt.getMonth()) + '-' +
    pad(dt.getDate()) + ' ' +
    pad(dt.getHours()) + ':' +
    pad(dt.getMinutes()) + '.' +
    pad(dt.getSeconds());
}

const vali_date = (_dt, date) => {
  const dt = new Date(_dt);
  return (dt !== "Invalid Date" && !isNaN(dt)) ? dt : date;
}

const diff_dates = (_d1, _d2) => {
  const d1 = new Date(_d1);
  const d2 = new Date(_d2);
  return Math.floor((d2 - d1) / (1000*60*60*24));
}

module.exports = { td, dd, format_date, vali_date, diff_dates, format_ymdhis }
