const generateDispatchNumber = () => {
  const num1 = Math.floor(1000 + Math.random() * 9000);
  const num2 = Math.floor(1000 + Math.random() * 9000);
  return `DSP-${num1}-${num2}`;
};

const generatePayrollId = () => {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `PAY-${year}${month}-${rand}`;
};

const generateRouteCode = (originCity = 'CHI', destCity = 'DET') => {
  const orig = originCity.slice(0, 3).toUpperCase();
  const dest = destCity.slice(0, 3).toUpperCase();
  const seq = Math.floor(10 + Math.random() * 90);
  return `RT-${orig}-${dest}-${seq}`;
};

const generateOrderNumber = () => {
  const date = new Date();
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${yyyy}${mm}-${rand}`;
};

module.exports = {
  generateDispatchNumber,
  generatePayrollId,
  generateRouteCode,
  generateOrderNumber,
};
