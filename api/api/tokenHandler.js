module.exports = {
  // TODO: Generate tokens and validate them
  generate: () => '728b540dae2a49b5f7f752a8b84037fb1',
  validate: (tok) => {
    try {
      if (tok.length >= 8) {
        return true; // valid
      }
      return false;
    } catch (err) {
      // runtime error - cannot validate
      return false;
    }
  },
  getCustomerId: (tok) => {
    // TODO: Get customerId from token
    console.log(`Tok: ${tok}`);
    return 5;
  }
};
