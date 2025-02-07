interface Config {
  verifier_url: string;
}
const config: Config = {
  verifier_url: process.env.VERIFIER_URL || 'http://localhost:3003',
};

export { config };
