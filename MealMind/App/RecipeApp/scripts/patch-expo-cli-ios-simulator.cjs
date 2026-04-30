/**
 * Expo CLI uses AppleScript ("System Events") to detect the Simulator app. That fails with
 * AppleEvent -10000 when the terminal (e.g. Cursor) is not allowed to automate System Events.
 * Re-apply after npm install so pressing `i` does not crash the dev server.
 */
const fs = require('fs');
const path = require('path');

const appRoot = path.join(__dirname, '..');
const cliRoots = [
  path.join(appRoot, 'node_modules', 'expo', 'node_modules', '@expo', 'cli'),
  path.join(appRoot, 'node_modules', '@expo', 'cli'),
];

const ensureRel = path.join(
  'build',
  'src',
  'start',
  'platforms',
  'ios',
  'ensureSimulatorAppRunning.js',
);
const admRel = path.join('build', 'src', 'start', 'platforms', 'ios', 'AppleDeviceManager.js');

function patchCliRoot(cliRoot) {
  const ensurePath = path.join(cliRoot, ensureRel);
  const admPath = path.join(cliRoot, admRel);
  if (!fs.existsSync(ensurePath)) {
    return false;
  }

  let ensure = fs.readFileSync(ensurePath, 'utf8');
  if (!ensure.includes('pgrep -x Simulator')) {
    const needle = `        throw error;
    }
    return true;
}
async function openSimulatorAppAsync`;
    if (!ensure.includes(needle)) {
      console.warn(
        '[patch-expo-cli-ios-simulator]',
        ensurePath,
        ': expected catch/throw pattern not found (Expo CLI layout changed?)',
      );
    } else {
      const replacement = `        try {
            const { execSync } = require('child_process');
            execSync('pgrep -x Simulator', {
                stdio: 'ignore'
            });
            return true;
        } catch  {
            return false;
        }
    }
    return true;
}
async function openSimulatorAppAsync`;
      ensure = ensure.replace(needle, replacement);
      fs.writeFileSync(ensurePath, ensure);
      console.info('[patch-expo-cli-ios-simulator] Patched ensureSimulatorAppRunning.js at', cliRoot);
    }
  }

  let adm = fs.readFileSync(admPath, 'utf8');
  const admNeedle = `    async activateWindowAsync() {
        await (0, _ensureSimulatorAppRunning.ensureSimulatorAppRunningAsync)(this.device);
        // TODO: Focus the individual window
        await _osascript().execAsync(\`tell application "Simulator" to activate\`);
    }`;
  const admPatched = `    async activateWindowAsync() {
        await (0, _ensureSimulatorAppRunning.ensureSimulatorAppRunningAsync)(this.device);
        // TODO: Focus the individual window
        try {
            await _osascript().execAsync(\`tell application "Simulator" to activate\`);
        } catch  {
        // AppleScript may be blocked without Automation for Simulator; Expo Go still opens.
        }
    }`;
  if (adm.includes('AppleScript may be blocked without Automation for Simulator')) {
    // already patched
  } else if (adm.includes(admNeedle)) {
    adm = adm.replace(admNeedle, admPatched);
    fs.writeFileSync(admPath, adm);
    console.info('[patch-expo-cli-ios-simulator] Patched AppleDeviceManager.js at', cliRoot);
  } else {
    console.warn('[patch-expo-cli-ios-simulator]', admPath, ': activateWindowAsync pattern not found (skip)');
  }

  return true;
}

function main() {
  let any = false;
  for (const cliRoot of cliRoots) {
    if (patchCliRoot(cliRoot)) {
      any = true;
    }
  }
  if (!any) {
    console.warn('[patch-expo-cli-ios-simulator] No @expo/cli install found (skip)');
  }
}

main();
