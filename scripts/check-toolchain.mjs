const expectedNodeMajor = 24;
const expectedPnpm = '11.4.0';
const nodeMajor = Number(process.versions.node.split('.')[0]);

if (nodeMajor !== expectedNodeMajor) {
  console.error(`FusionDB requires Node.js ${expectedNodeMajor}.x. Current: ${process.versions.node}`);
  process.exitCode = 1;
} else {
  console.log(`Node.js ${process.versions.node} OK`);
}

console.log(`Expected pnpm: ${expectedPnpm}`);
console.log('Run `pnpm --version` to verify the package manager after installation.');
