import { useState } from "react";

export function useModalManager() {
  const [activeModal, setActiveModal] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProjectionsModalOpen, setIsProjectionsModalOpen] = useState(false);
  const [isCapitalGrowthOpen, setIsCapitalGrowthOpen] = useState(false);

  return {
    activeModal, setActiveModal,
    isModalOpen, setIsModalOpen,
    isProjectionsModalOpen, setIsProjectionsModalOpen,
    isCapitalGrowthOpen, setIsCapitalGrowthOpen
  };
}