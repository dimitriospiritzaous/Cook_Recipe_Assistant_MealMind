/**
 * Extra search terms so stock + video providers return finished dishes / tutorials,
 * not raw-ingredient photography.
 */
export function cookedDishSearchSuffix(title: string): string {
  const t = title.toLowerCase();
  if (/\bstir[\s-]?fry\b/.test(t)) {
    return 'stir fry wok cooked vegetables sauce plated hot meal';
  }
  if (/\bomelet|omelette|frittata|scrambl/.test(t)) {
    return 'omelet egg breakfast plate cooked golden';
  }
  if (/\bsoup\b/.test(t)) {
    return 'soup bowl hot cooked steaming';
  }
  if (/\bcurry\b/.test(t)) {
    return 'curry bowl cooked sauce rice plated';
  }
  if (/\bpasta\b|spaghetti|penne|noodle|ramen|udon/.test(t)) {
    return 'pasta noodles cooked sauce plated bowl';
  }
  if (/\bsalad\b/.test(t)) {
    return 'salad bowl mixed plated dressed';
  }
  if (/\btaco|burrito|quesadilla/.test(t)) {
    return 'served plated filled cooked';
  }
  if (/\b(bake|baked|roast|roasted|casserole|gratin)\b/.test(t)) {
    return 'baked roasted cooked served hot dish';
  }
  if (/\b(one[\s-]?pan|skillet|sheet[\s-]?pan)\b/.test(t)) {
    return 'one pan skillet meal cooked finished plated';
  }
  if (/\b(fried rice|risotto|paella|pilaf)\b/.test(t)) {
    return 'cooked rice dish plated bowl';
  }
  if (/\b(burger|sandwich|toast|wrap)\b/.test(t)) {
    return 'cooked served plated meal';
  }
  return 'cooked plated dish homemade natural light rustic table authentic food photo';
}
