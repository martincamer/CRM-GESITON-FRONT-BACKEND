// frontend/src/utils/obtenerId.js
export const obtenerId = (objeto) => {
  return objeto && objeto._id ? objeto._id : null;
};
