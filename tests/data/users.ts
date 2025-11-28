export const users = {
  standard: {
    user: process.env.E2E_USER || 'standard_user',
    pass: process.env.E2E_PASS || 'secret_sauce'
  },
  locked: {
    user: 'locked_out_user',
    pass: process.env.E2E_PASS || 'secret_sauce'
  }
};

export default users;