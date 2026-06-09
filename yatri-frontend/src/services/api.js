import { transportCatalog } from "../data/transports";

const delay = (duration = 700) =>
  new Promise((resolve) => {
    window.setTimeout(resolve, duration);
  });

export async function fetchTransportTypes() {
  await delay(400);
  return Object.keys(transportCatalog);
}

export async function fetchTransportList(type) {
  await delay(900);
  return transportCatalog[type] || [];
}

export async function fetchTransportById(type, id) {
  await delay(650);
  return (transportCatalog[type] || []).find((item) => item.id === id) || null;
}
