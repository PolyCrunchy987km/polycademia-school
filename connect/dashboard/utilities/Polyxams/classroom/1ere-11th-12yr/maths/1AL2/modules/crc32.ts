/**
 * Calcul de checksum CRC32 UTF-8 compatible.
 * Fonctionne pour tout type de texte (accents, emojis, etc.)
 * et pour des tableaux de chaînes (string[]).
 */

export class CRC32 {
  private static readonly TABLE = CRC32.makeTable()

  // Génération unique de la table CRC32
  private static makeTable(): Uint32Array {
    const table = new Uint32Array(256)
    for (let i = 0; i < 256; i++) {
      let c = i
      for (let k = 0; k < 8; k++) {
        c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
      }
      table[i] = c >>> 0
    }
    return table
  }

  /**
   * Calcule le CRC32 d'une chaîne de caractères (UTF-8)
   * @param str Chaîne d'entrée
   * @returns Entier non signé 32 bits
   */
  static fromString(str: string): number {
    const encoder = new TextEncoder()
    const bytes = encoder.encode(str)
    let crc = 0xffffffff
    for (let i = 0; i < bytes.length; i++) {
      crc = this.TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8)
    }
    return (crc ^ 0xffffffff) >>> 0
  }

  /**
   * Calcule un CRC32 unique pour un tableau de chaînes
   * @param strings Tableau de chaînes
   * @returns Entier non signé 32 bits
   */
  static fromArray(strings: string[]): number {
    let combinedCRC = 0xffffffff
    for (const str of strings) {
      const crc = this.fromString(str)
      // combine de manière déterministe
      combinedCRC =
        this.TABLE[(combinedCRC ^ (crc & 0xff)) & 0xff] ^ (combinedCRC >>> 8)
      combinedCRC ^= crc >>> 8
    }
    return (combinedCRC ^ 0xffffffff) >>> 0
  }

  /**
   * Renvoie un identifiant court en hexadécimal
   * @param input chaîne ou tableau
   * @returns exemple: "b1e6b084"
   */
  static hex(input: string | string[]): string {
    const value = Array.isArray(input)
      ? this.fromArray(input)
      : this.fromString(input)
    return value.toString(16).padStart(8, '0')
  }

  /**
   * Renvoie un identifiant court en hexadécimal
   * @param inputs tableau
   * @returns exemple: "b1e6b084"
   */
  static hexQuestions(inputs: string[]): string {
    let resu = ''
    inputs.forEach((input, i) => {
      const v = this.hex(input)
      resu += i === 0 ? v : '|' + v
    })
    return resu
  }
}

// --- Exemple d'utilisation ---
// console.log(CRC32.hex("bonjour"));           // → "b1e6b084"
// console.log(CRC32.hex(["école", "année"]));  // → "7b5b55a1"
