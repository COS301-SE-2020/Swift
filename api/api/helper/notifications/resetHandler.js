let result = '';

module.exports = {
  getCode: () => {
    result = '';
    for (let i = 0; i < 19; ++i) result += Math.floor(Math.random() * 10);
    const value = result.substring(8, 12);
    value.trim();
    return { code: value };
  },
  validateCode: (code) => {
    const value = result.substring(8, 12);
    value.trim();
    if (code === value) return { status: true };
    return { status: false };
  }

};
