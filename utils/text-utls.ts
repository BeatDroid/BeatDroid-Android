const prefixUrl = process.env.EXPO_PUBLIC_BASE_URL || "";
const prefixUrlWithApi = `${prefixUrl.split("://")[1]}/api/v1/`;

export const parsePosterUrl = (url: string) => {
  return url.split(`${prefixUrlWithApi}`)[1];
};

export const parsePosterUrlWithApi = (url: string) => {
  return `${prefixUrl}/api/v1/${url}`;
};

export const searchRegex =
  /^[\w\s\-_.'()&!?,":;\[\]{}+=@#$%^*~/|\\<>À-ÿĀ-žА-я一-龯]+$/;

// Regex for typical lyrics: allows letters (including Unicode), numbers, spaces,
// common punctuation (.,!?'"-;:()), line breaks, and special characters like &, *, #, @
// Also allows apostrophes, quotes, parentheses, brackets, slashes, and emoji ranges
export const lyricsRegex =
  /^[\w\s\-_.'()&!?,":;\[\]{}+=@#$%^*~/|\\<>\n\rÀ-ÿĀ-žА-я一-龯\u{1F300}-\u{1F9FF}]+$/u;

export const parseLyrics = (lyrics: string) =>
  lyrics.split("\n").map((line) => {
    const match = line.match(/^(\d+):\s*(.*)$/);
    return match
      ? { id: Number(match[1]), text: match[2].trim() }
      : { id: 0, text: line.trim() };
  });

export const testLyrics =
  "1: If there's another universe\n2: Please make some noise (noise)\n3: Give me a sign (sign)\n4: This can't be life\n5: \n6: If there's a point to losing love\n7: Repeating pain (why?)\n8: It's all the same (same)\n9: I hate this place\n10: \n11: Stuck in this paradigm\n12: Don't believe in paradise\n13: This must be what Hell is like\n14: There's got to be more, got to be more\n15: \n16: Sick of this head of mine\n17: Intrusive thoughts, they paralyze\n18: Nirvana's not as advertised\n19: There's got to be more, been here before\n20: \n21: Oh (oh, ooh)\n22: Life's better on Saturn\n23: Got to break this pattern\n24: Of floating away\n25: \n26: Oh (oh, ooh)\n27: Find something worth saving\n28: It's all for the taking\n29: I always say\n30: \n31: I'll be better on Saturn\n32: None of this matters\n33: Dreaming of Saturn, oh\n34: \n35: If karma's really real\n36: How am I still here?\n37: Just seems so unfair\n38: I could be wrong though\n39: \n40: If there's a point to being good\n41: Then where's my reward?\n42: The good die young and poor\n43: I gave it all I could\n44: \n45: Stuck in this terradome\n46: All I see is terrible\n47: Making us hysterical\n48: There's got to be more, got to be more\n49: \n50: Sick of this head of mine\n51: Intrusive thoughts, they paralyze\n52: Nirvana's not as advertised\n53: There's got to be more, been here before\n54: \n55: Oh (oh, ooh)\n56: Life's better on Saturn\n57: Got to break this pattern\n58: Of floating away\n59: \n60: Oh (oh, ooh)\n61: Find something worth saving\n62: It's all for the taking\n63: I always say\n64: \n65: I'll be better on Saturn\n66: None of this matters\n67: Dreaming of Saturn, oh\n68: \n69: Ooh, ooh\n70: Ooh-ooh\n71: Ooh, ooh\n72: Ooh-ooh";
