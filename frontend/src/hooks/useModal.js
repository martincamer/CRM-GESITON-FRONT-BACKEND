import { useState } from "react";

const useModal = (modalIds = []) => {
  // Crear objeto inicial de estados basado en los IDs proporcionados
  const initialState = modalIds.reduce((acc, modalId) => {
    acc[modalId] = false;
    return acc;
  }, {});

  const [modalStates, setModalStates] = useState(initialState);

  // Función para abrir un modal específico
  const openModal = (modalId) => {
    setModalStates((prev) => ({
      ...prev,
      [modalId]: true,
    }));
  };

  // Función para cerrar un modal específico
  const closeModal = (modalId) => {
    setModalStates((prev) => ({
      ...prev,
      [modalId]: false,
    }));
  };

  // Función para alternar el estado de un modal
  const toggleModal = (modalId) => {
    setModalStates((prev) => ({
      ...prev,
      [modalId]: !prev[modalId],
    }));
  };

  return {
    modalStates,
    openModal,
    closeModal,
    toggleModal,
  };
};

export default useModal;
