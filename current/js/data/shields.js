// Blindagens (placas à frente da sonda). Cada uma tem material e espessura reais;
// o Geiger calcula a transmissão a partir disso (fisica/geiger.js), por tipo e energia.
// Espessuras: alumínio 3 mm, acrílico 5 mm, chumbo 10 mm (projeto 3a, D4; o chumbo ficou em
// 1 cm e não 2 mm porque a 2 mm a queda do gama de 1,25 MeV (12%) se perde no ruído de Poisson).
export const SHIELDS = [
    { id: 0, name: "None",     key: "none", material: null,       cm: 0 },
    { id: 1, name: "Aluminum", key: "alu",  material: "aluminio", cm: 0.3 },
    { id: 2, name: "Acrylic",  key: "acr",  material: "acrilico", cm: 0.5 },
    { id: 3, name: "Lead",     key: "pb",   material: "chumbo",   cm: 1.0 },
];

// v3.35 (Fase E): placa de material hidrogenado, só em campo da Agência depois da pesquisa do detector de nêutrons.
// Fica FORA de SHIELDS de propósito: a lista acima alimenta o cofre e a ficha de placas de gama. Polietileno: ~14 % de H em massa, 0,92 g/cm³ (Fermilab TM-1834, cap. 6) [V];
// 5 cm é escolha de jogo [H] (para a placa atenuar nêutrons de forma visível).
export const PLACA_NEUTRON = { id: 4, name: "Polyethylene", key: "pe", material: "polietileno", cm: 5 };
