// StatsService.gs - Dashboard calculations

function getDashboardStats() {
  const sheet = getSheet();
  if (sheet.getLastRow() <= 1) return { total: 0, active: 0, pending: 0 };
  
  const data = sheet.getRange(2, 1, sheet.getLastRow()-1, sheet.getLastColumn()).getValues();
  let active = 0;
  let pending = 0;
  
  data.forEach(r => {
    // Status is Column L (index 11)
    if (r[11] === 'Active') active++;
    // Agreement is Column P (index 15)
    if (String(r[15]).includes('Needs')) pending++;
  });
  
  return { total: data.length, active: active, pending: pending };
}