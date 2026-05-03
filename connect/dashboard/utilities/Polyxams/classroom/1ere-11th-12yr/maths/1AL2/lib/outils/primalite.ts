/**
 * Calcule le PGCD (Plus Grand Commun Diviseur) de deux nombres en utilisant l'algorithme d'Euclide
 * @param {number} a - Premier nombre
 * @param {number} b - Deuxième nombre
 * @returns {number} Le PGCD de a et b
 */
export function gcd(a: number, b: number): number {
  a = Math.abs(a)
  b = Math.abs(b)

  if (b === 0) return a
  if (a === 0) return b

  while (b !== 0) {
    const temp = b
    b = a % b
    a = temp
  }
  return a
}

/**
 * Calcule le PGCD de plusieurs nombres
 * @param {...number} args - Liste des nombres
 * @returns {number} Le PGCD de tous les nombres
 */
export function gcdMultiple(...args: number[]): number {
  if (args.length === 0) return 0
  if (args.length === 1) return Math.abs(args[0])

  return args.reduce((acc, current) => gcd(acc, current))
}

/**
 * Vérifie si un nombre est premier
 * @param {number} n - Le nombre à tester
 * @returns {boolean} true si le nombre est premier, false sinon
 */
function isPrime(n: number): boolean {
  if (!Number.isInteger(n) || n < 2) return false
  if (n === 2) return true
  if (n % 2 === 0) return false

  // On teste seulement les nombres impairs jusqu'à sqrt(n)
  const sqrt = Math.sqrt(n)
  for (let i = 3; i <= sqrt; i += 2) {
    if (n % i === 0) return false
  }
  return true
}

/**
 * Renvoie le PGCD de deux nombres
 * @author Rémi Angot
 */
export function pgcd(...args: number[]) {
  return gcdMultiple(...args)
}

/**
 * Renvoie le PPCM de deux nombres
 * @author Rémi Angot
 */
export function ppcm(a: number, b: number): number {
  if (a === 0 || b === 0) return 0
  return Math.abs(a * b) / pgcd(a, b)
}

/**
 * Renvoie le PPCM d'une liste de nombres
 * @param numbers - Liste des nombres
 * @returns Le PPCM de tous les nombres de la liste
 * @author Nathan Scheinmann
 */
export function ppcmListe(numbers: number[]): number {
  if (numbers.length === 0) return 0
  if (numbers.length === 1) return Math.abs(numbers[0])

  return numbers.reduce((acc, current) => ppcm(acc, current))
}

/**
 * Donne la liste des facteurs premiers d'un nombre
 * @param { number } n - Nombre à décomposer
 * @returns {number[]} - Liste des facteurs premiers
 */
export function obtenirListeFacteursPremiers(n: number) {
  if (n === 1 || n === 0) return [] // 1 n'est pas premier, mais, sinon, ça retourne [NaN]
  const facteurs = []
  const signe = n < 0 ? -1 : 1
  let nAbs = Math.abs(n)

  for (let i = 2; i <= nAbs; i++) {
    while (nAbs % i === 0) {
      facteurs.push(i)
      nAbs /= i
    }
  }

  if (facteurs.length > 0) {
    facteurs[0] = signe * facteurs[0]
  }
  return facteurs
}

/**
 * Retourne un nombre semi-premier aléatoire inférieur ou égal à max
 * @param {number} max
 * @return {number} un nombre semi-premier <= max
 * @author Guillaume Valmont
 */
export function obtenirSemiPremier(max: number): number {
  const listePremiers = listeNombresPremiersStrictJusqua(max + 1)
  const semiPremiers: number[] = []

  // Génère tous les produits de deux premiers distincts <= max
  for (let i = 0; i < listePremiers.length; i++) {
    for (let j = i + 1; j < listePremiers.length; j++) {
      const semiPremier = listePremiers[i] * listePremiers[j]
      if (semiPremier <= max) semiPremiers.push(semiPremier)
    }
  }

  if (semiPremiers.length === 0) {
    window.notify('Pas de semi-premier < max trouvé.', { max })
    return 6
  }

  // Renvoie un semi-premier au hasard en utilisant Math.random()
  const indexAleatoire = Math.floor(Math.random() * semiPremiers.length)
  return semiPremiers[indexAleatoire]
}

/**
 *
 * @param {Entier} n
 * Retourne la factorisation d'un entier sous la forme [[a0,n0],[a1,n1],...] où a0,a1 sont les facteurs premiers et n0, n1 sont les exposants de ces facteurs.
 * @author Jean-Claude Lhote
 */

export function factorisation(n: number): [number, number][] {
  if (n === 1) return [[1, 1]]
  const liste = obtenirListeFacteursPremiers(n)
  const facto: [number, number][] = []
  let index = 0
  for (let i = 0; i < liste.length; ) {
    if (liste[i] === 0) i++
    else {
      facto.push([liste[i], 1])
      index++
      for (let j = i + 1; j < liste.length; j++) {
        if (liste[j] === liste[i]) {
          facto[index - 1][1]++
          liste[j] = 0
        }
      }
      i++
    }
  }
  return facto
}

/**
 *
 * @param {number} n
 * @param {boolean} puissancesOn
 * @returns {string} texFacto
 */
export function texFactorisation(n: number, puissancesOn = true) {
  let texFacto = ''
  let facto = []
  if (puissancesOn) {
    facto = factorisation(n)
    for (let i = 0; i < facto.length - 1; i++) {
      texFacto += `${facto[i][0]}${facto[i][1] > 1 ? '^{' + facto[i][1] + '}\\times ' : '\\times '}`
    }
    texFacto += `${facto[facto.length - 1][0]}${facto[facto.length - 1][1] > 1 ? '^{' + facto[facto.length - 1][1] + '}' : ''}`
  } else {
    facto = obtenirListeFacteursPremiers(n)
    for (let i = 0; i < facto.length - 1; i++) {
      texFacto += `${facto[i]}\\times `
    }
    texFacto += `${facto[facto.length - 1]}`
  }
  return texFacto
}

/**
 * Renvoie un tableau contenant les diviseurs d'un nombre entier, rangés dans l'ordre croissant
 * @param {number} n
 * @author Sébastien Lozano
 */
export function listeDesDiviseurs(n: number) {
  let i = 2
  const diviseurs = [1]
  while (i <= n) {
    if (n % i === 0) {
      diviseurs.push(i)
    }
    i++
  }
  return diviseurs
}

export function estPremier(n: number) {
  return isPrime(n)
}
/**
 * Retourne la liste des nombres premiers inférieurs à N N<300 N exclu
 * @param {number} k On cherchera un multiple de k
 * @param {number} n Ce multiple sera supérieur ou égal à n
 * @author Rémi Angot
 */
export function premierMultipleSuperieur(k: number, n: number) {
  let result = n
  let reste
  if (Number.isInteger(k) && Number.isInteger(n)) {
    while (result % k !== 0) {
      result += 1
    }
    return result
  } else {
    if (Math.floor(n / k) === n / k) return n
    else {
      reste = n / k - Math.floor(n / k)
      return n - reste * k + k
    }
  }
}

export function premierMultipleInferieur(k: number, n: number) {
  const result = premierMultipleSuperieur(k, n)
  if (result !== n) return result - k
  else return n
}

/**
 * Retourne la liste des nombres premiers inférieurs à N N<1000 N exclu
 * @param {number} borneSup
 * @author Sébastien Lozano
 * Augmenté des N<300 à N<1000 par Guillaume Valmont
 */
export function listeNombresPremiersStrictJusqua(borneSup: number) {
  // tableau contenant les 1000 premiers nombres premiers
  const liste1000 = [
    2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71,
    73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151,
    157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 211, 223, 227, 229, 233,
    239, 241, 251, 257, 263, 269, 271, 277, 281, 283, 293, 307, 311, 313, 317,
    331, 337, 347, 349, 353, 359, 367, 373, 379, 383, 389, 397, 401, 409, 419,
    421, 431, 433, 439, 443, 449, 457, 461, 463, 467, 479, 487, 491, 499, 503,
    509, 521, 523, 541, 547, 557, 563, 569, 571, 577, 587, 593, 599, 601, 607,
    613, 617, 619, 631, 641, 643, 647, 653, 659, 661, 673, 677, 683, 691, 701,
    709, 719, 727, 733, 739, 743, 751, 757, 761, 769, 773, 787, 797, 809, 811,
    821, 823, 827, 829, 839, 853, 857, 859, 863, 877, 881, 883, 887, 907, 911,
    919, 929, 937, 941, 947, 953, 967, 971, 977, 983, 991, 997, 1009, 1013,
    1019, 1021, 1031, 1033, 1039, 1049, 1051, 1061, 1063, 1069, 1087, 1091,
    1093, 1097, 1103, 1109, 1117, 1123, 1129, 1151, 1153, 1163, 1171, 1181,
    1187, 1193, 1201, 1213, 1217, 1223, 1229, 1231, 1237, 1249, 1259, 1277,
    1279, 1283, 1289, 1291, 1297, 1301, 1303, 1307, 1319, 1321, 1327, 1361,
    1367, 1373, 1381, 1399, 1409, 1423, 1427, 1429, 1433, 1439, 1447, 1451,
    1453, 1459, 1471, 1481, 1483, 1487, 1489, 1493, 1499, 1511, 1523, 1531,
    1543, 1549, 1553, 1559, 1567, 1571, 1579, 1583, 1597, 1601, 1607, 1609,
    1613, 1619, 1621, 1627, 1637, 1657, 1663, 1667, 1669, 1693, 1697, 1699,
    1709, 1721, 1723, 1733, 1741, 1747, 1753, 1759, 1777, 1783, 1787, 1789,
    1801, 1811, 1823, 1831, 1847, 1861, 1867, 1871, 1873, 1877, 1879, 1889,
    1901, 1907, 1913, 1931, 1933, 1949, 1951, 1973, 1979, 1987, 1993, 1997,
    1999, 2003, 2011, 2017, 2027, 2029, 2039, 2053, 2063, 2069, 2081, 2083,
    2087, 2089, 2099, 2111, 2113, 2129, 2131, 2137, 2141, 2143, 2153, 2161,
    2179, 2203, 2207, 2213, 2221, 2237, 2239, 2243, 2251, 2267, 2269, 2273,
    2281, 2287, 2293, 2297, 2309, 2311, 2333, 2339, 2341, 2347, 2351, 2357,
    2371, 2377, 2381, 2383, 2389, 2393, 2399, 2411, 2417, 2423, 2437, 2441,
    2447, 2459, 2467, 2473, 2477, 2503, 2521, 2531, 2539, 2543, 2549, 2551,
    2557, 2579, 2591, 2593, 2609, 2617, 2621, 2633, 2647, 2657, 2659, 2663,
    2671, 2677, 2683, 2687, 2689, 2693, 2699, 2707, 2711, 2713, 2719, 2729,
    2731, 2741, 2749, 2753, 2767, 2777, 2789, 2791, 2797, 2801, 2803, 2819,
    2833, 2837, 2843, 2851, 2857, 2861, 2879, 2887, 2897, 2903, 2909, 2917,
    2927, 2939, 2953, 2957, 2963, 2969, 2971, 2999, 3001, 3011, 3019, 3023,
    3037, 3041, 3049, 3061, 3067, 3079, 3083, 3089, 3109, 3119, 3121, 3137,
    3163, 3167, 3169, 3181, 3187, 3191, 3203, 3209, 3217, 3221, 3229, 3251,
    3253, 3257, 3259, 3271, 3299, 3301, 3307, 3313, 3319, 3323, 3329, 3331,
    3343, 3347, 3359, 3361, 3371, 3373, 3389, 3391, 3407, 3413, 3433, 3449,
    3457, 3461, 3463, 3467, 3469, 3491, 3499, 3511, 3517, 3527, 3529, 3533,
    3539, 3541, 3547, 3557, 3559, 3571, 3581, 3583, 3593, 3607, 3613, 3617,
    3623, 3631, 3637, 3643, 3659, 3671, 3673, 3677, 3691, 3697, 3701, 3709,
    3719, 3727, 3733, 3739, 3761, 3767, 3769, 3779, 3793, 3797, 3803, 3821,
    3823, 3833, 3847, 3851, 3853, 3863, 3877, 3881, 3889, 3907, 3911, 3917,
    3919, 3923, 3929, 3931, 3943, 3947, 3967, 3989, 4001, 4003, 4007, 4013,
    4019, 4021, 4027, 4049, 4051, 4057, 4073, 4079, 4091, 4093, 4099, 4111,
    4127, 4129, 4133, 4139, 4153, 4157, 4159, 4177, 4201, 4211, 4217, 4219,
    4229, 4231, 4241, 4243, 4253, 4259, 4261, 4271, 4273, 4283, 4289, 4297,
    4327, 4337, 4339, 4349, 4357, 4363, 4373, 4391, 4397, 4409, 4421, 4423,
    4441, 4447, 4451, 4457, 4463, 4481, 4483, 4493, 4507, 4513, 4517, 4519,
    4523, 4547, 4549, 4561, 4567, 4583, 4591, 4597, 4603, 4621, 4637, 4639,
    4643, 4649, 4651, 4657, 4663, 4673, 4679, 4691, 4703, 4721, 4723, 4729,
    4733, 4751, 4759, 4783, 4787, 4789, 4793, 4799, 4801, 4813, 4817, 4831,
    4861, 4871, 4877, 4889, 4903, 4909, 4919, 4931, 4933, 4937, 4943, 4951,
    4957, 4967, 4969, 4973, 4987, 4993, 4999, 5003, 5009, 5011, 5021, 5023,
    5039, 5051, 5059, 5077, 5081, 5087, 5099, 5101, 5107, 5113, 5119, 5147,
    5153, 5167, 5171, 5179, 5189, 5197, 5209, 5227, 5231, 5233, 5237, 5261,
    5273, 5279, 5281, 5297, 5303, 5309, 5323, 5333, 5347, 5351, 5381, 5387,
    5393, 5399, 5407, 5413, 5417, 5419, 5431, 5437, 5441, 5443, 5449, 5471,
    5477, 5479, 5483, 5501, 5503, 5507, 5519, 5521, 5527, 5531, 5557, 5563,
    5569, 5573, 5581, 5591, 5623, 5639, 5641, 5647, 5651, 5653, 5657, 5659,
    5669, 5683, 5689, 5693, 5701, 5711, 5717, 5737, 5741, 5743, 5749, 5779,
    5783, 5791, 5801, 5807, 5813, 5821, 5827, 5839, 5843, 5849, 5851, 5857,
    5861, 5867, 5869, 5879, 5881, 5897, 5903, 5923, 5927, 5939, 5953, 5981,
    5987, 6007, 6011, 6029, 6037, 6043, 6047, 6053, 6067, 6073, 6079, 6089,
    6091, 6101, 6113, 6121, 6131, 6133, 6143, 6151, 6163, 6173, 6197, 6199,
    6203, 6211, 6217, 6221, 6229, 6247, 6257, 6263, 6269, 6271, 6277, 6287,
    6299, 6301, 6311, 6317, 6323, 6329, 6337, 6343, 6353, 6359, 6361, 6367,
    6373, 6379, 6389, 6397, 6421, 6427, 6449, 6451, 6469, 6473, 6481, 6491,
    6521, 6529, 6547, 6551, 6553, 6563, 6569, 6571, 6577, 6581, 6599, 6607,
    6619, 6637, 6653, 6659, 6661, 6673, 6679, 6689, 6691, 6701, 6703, 6709,
    6719, 6733, 6737, 6761, 6763, 6779, 6781, 6791, 6793, 6803, 6823, 6827,
    6829, 6833, 6841, 6857, 6863, 6869, 6871, 6883, 6899, 6907, 6911, 6917,
    6947, 6949, 6959, 6961, 6967, 6971, 6977, 6983, 6991, 6997, 7001, 7013,
    7019, 7027, 7039, 7043, 7057, 7069, 7079, 7103, 7109, 7121, 7127, 7129,
    7151, 7159, 7177, 7187, 7193, 7207, 7211, 7213, 7219, 7229, 7237, 7243,
    7247, 7253, 7283, 7297, 7307, 7309, 7321, 7331, 7333, 7349, 7351, 7369,
    7393, 7411, 7417, 7433, 7451, 7457, 7459, 7477, 7481, 7487, 7489, 7499,
    7507, 7517, 7523, 7529, 7537, 7541, 7547, 7549, 7559, 7561, 7573, 7577,
    7583, 7589, 7591, 7603, 7607, 7621, 7639, 7643, 7649, 7669, 7673, 7681,
    7687, 7691, 7699, 7703, 7717, 7723, 7727, 7741, 7753, 7757, 7759, 7789,
    7793, 7817, 7823, 7829, 7841, 7853, 7867, 7873, 7877, 7879, 7883, 7901,
    7907, 7919, 7927, 7933, 7937, 7949, 7951, 7963, 7993, 8009, 8011, 8017,
    8039, 8053, 8059, 8069, 8081, 8087, 8089, 8093, 8101, 8111, 8117, 8123,
    8147, 8161, 8167, 8171, 8179, 8191, 8209, 8219, 8221, 8231, 8233, 8237,
    8243, 8263, 8269, 8273, 8287, 8291, 8293, 8297, 8311, 8317, 8329, 8353,
    8363, 8369, 8377, 8387, 8389, 8419, 8423, 8429, 8431, 8443, 8447, 8461,
    8467, 8501, 8513, 8521, 8527, 8537, 8539, 8543, 8563, 8573, 8581, 8597,
    8599, 8609, 8623, 8627, 8629, 8641, 8647, 8663, 8669, 8677, 8681, 8689,
    8693, 8699, 8707, 8713, 8719, 8731, 8737, 8741, 8747, 8753, 8761, 8779,
    8783, 8803, 8807, 8819, 8821, 8831, 8837, 8839, 8849, 8861, 8863, 8867,
    8887, 8893, 8923, 8929, 8933, 8941, 8951, 8963, 8969, 8971, 8999, 9001,
    9007, 9011, 9013, 9029, 9041, 9043, 9049, 9059, 9067, 9091, 9103, 9109,
    9127, 9133, 9137, 9151, 9157, 9161, 9173, 9181, 9187, 9199, 9203, 9209,
    9221, 9227, 9239, 9241, 9257, 9277, 9281, 9283, 9293, 9311, 9319, 9323,
    9337, 9341, 9343, 9349, 9371, 9377, 9391, 9397, 9403, 9413, 9419, 9421,
    9431, 9433, 9437, 9439, 9461, 9463, 9467, 9473, 9479, 9491, 9497, 9511,
    9521, 9533, 9539, 9547, 9551, 9587, 9601, 9613, 9619, 9623, 9629, 9631,
    9643, 9649, 9661, 9677, 9679, 9689, 9697, 9719, 9721, 9733, 9739, 9743,
    9749, 9767, 9769, 9781, 9787, 9791, 9803, 9811, 9817, 9829, 9833, 9839,
    9851, 9857, 9859, 9871, 9883, 9887, 9901, 9907, 9923, 9929, 9931, 9941,
    9949, 9967, 9973,
  ]
  const liste = []
  let i = 0
  while (liste1000[i] < borneSup) {
    liste.push(liste1000[i])
    i++
  }
  return liste
}

/**
 * Liste les nombres premiers jusque n avec la méthode du crible d'Eratosthene optimisée
 * @param {number} n
 * @author Sébastien Lozano
 */
export function cribleEratostheneN(n: number) {
  const tabEntiers = [] // pour tous les entiers de 2 à n
  const testMax = Math.sqrt(n + 1) // inutile de tester au dela de racine de n
  const liste = [] // tableau de la liste des premiers jusqu'à n

  // On rempli un tableau avec des booléeens de 2 à n
  for (let i = 0; i < n + 1; i++) {
    tabEntiers.push(true)
  }

  // On supprime les multiples des nombres premiers à partir de 2, 3, 5,...
  for (let i = 2; i <= testMax; i++) {
    if (tabEntiers[i]) {
      for (let j = i * i; j < n + 1; j += i) {
        tabEntiers[j] = false
      }
    }
  }

  // On récupère tous les indices du tableau des entiers dont le booléen est à true qui sont donc premiers
  for (let i = 2; i < n + 1; i++) {
    if (tabEntiers[i]) {
      liste.push(i)
    }
  }

  return liste
}

/**
 * Liste les premiers compris entre min et max au sens large,
 * min est inclu
 * max est inclu.
 * @param {number} min
 * @param {number} max
 * @author Sébastien Lozano
 */

export function premiersEntreBornes(min: number, max: number) {
  // on crée les premiers jusque min
  const premiersASupprimer = cribleEratostheneN(min - 1)
  // on crée les premiers jusque max
  const premiersJusqueMax = cribleEratostheneN(max)
  // on supprime le début de la liste jusque min
  premiersJusqueMax.splice(0, premiersASupprimer.length)
  // on renvoie le tableau restant
  return premiersJusqueMax
}

/**
 * renvoie un tableau avec la decomposition en facteurs premiers sous forme développée
 * @param {number} n
 * @author Sébastien Lozano
 */
export function decompositionFacteursPremiersArray(n: number) {
  const decomposition = []
  const liste = obtenirListeFacteursPremiers(n)
  for (const i in liste) {
    decomposition.push(liste[i])
  }
  return decomposition
}

/**
 * Retourne la liste des nombres premiers inférieurs à 300
 * @author Rémi Angot
 */
export function obtenirListeNombresPremiers(n = 300) {
  const prems = [
    2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71,
    73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151,
    157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 211, 223, 227, 229, 233,
    239, 241, 251, 257, 263, 269, 271, 277, 281, 283, 293,
  ]
  for (let i = 307; i <= n; i++) {
    if (isPrime(i)) prems.push(i)
  }
  return prems
}

/**
 * Retourne le code LaTeX de la décomposition en produit de facteurs premiers d'un nombre
 * @author Rémi Angot
 */
export function decompositionFacteursPremiers(n: number) {
  let decomposition = ''
  if (Math.abs(n) === 1) return n // EE : Nécessaire pour 4C22... Vérifier si aucun dommage collatéral ailleurs (29/04/2024)
  const liste = obtenirListeFacteursPremiers(n)
  for (const i in liste) {
    decomposition += `${liste[i] < 0 ? `(${liste[i]})` : `${liste[i]}`}\\times`
  }
  decomposition = decomposition.substring(0, decomposition.length - 6)
  return decomposition
}

/**
 *
 * @param {number} n
 * @param {boolean} inférieur si true, commence la recherche à 2 en croissant sinon commence à n+1
 * @returns {number}
 */
export function premierAvec(
  n: number,
  listeAEviter: number[] = [],
  inferieur = true,
) {
  if (n < 2) throw Error(`Impossible de trouver un nombre premier avec ${n}`)
  let candidat = inferieur ? 2 : n + 1
  do {
    if (pgcd(n, candidat) === 1 && !listeAEviter.includes(candidat))
      return candidat
    candidat++
  } while (true)
}
