import { useState, useEffect } from 'react';
import api from '../services/api';

/**
 * Custom hook that manages cascading district → sector → cell dropdowns
 * Fetches each level from the API when the parent selection changes
 */
export const useLocationData = () => {
  const [districts, setDistricts] = useState([]);
  const [sectors,   setSectors]   = useState([]);
  const [cells,     setCells]     = useState([]);

  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedSector,   setSelectedSector]   = useState('');
  const [selectedCell,     setSelectedCell]     = useState('');
  const [village,          setVillage]          = useState('');

  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingSectors,   setLoadingSectors]   = useState(false);
  const [loadingCells,     setLoadingCells]     = useState(false);

  // Load districts on mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoadingDistricts(true);
    api.get('/auth/districts')
      .then(res => setDistricts(res.data))
      .finally(() => setLoadingDistricts(false));
  }, []);

  // Load sectors when district changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!selectedDistrict) { setSectors([]); setCells([]); return; }
    setSelectedSector('');
    setSelectedCell('');
    setSectors([]);
    setCells([]);
    setLoadingSectors(true);
    api.get(`/auth/sectors/${selectedDistrict}`)
      .then(res => setSectors(res.data))
      .finally(() => setLoadingSectors(false));
  }, [selectedDistrict]);

  // Load cells when sector changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!selectedSector) { setCells([]); return; }
    setSelectedCell('');
    setCells([]);
    setLoadingCells(true);
    api.get(`/auth/cells/${selectedSector}`)
      .then(res => setCells(res.data))
      .finally(() => setLoadingCells(false));
  }, [selectedSector]);

  const handleDistrictChange = (value) => setSelectedDistrict(value);
  const handleSectorChange   = (value) => setSelectedSector(value);
  const handleCellChange     = (value) => setSelectedCell(value);

  const isComplete = selectedDistrict && selectedSector && selectedCell;

  return {
    // Data
    districts, sectors, cells,
    // Selected values
    selectedDistrict, selectedSector, selectedCell, village,
    // Handlers
    handleDistrictChange, handleSectorChange, handleCellChange,
    setVillage,
    // Loading states
    loadingDistricts, loadingSectors, loadingCells,
    // Validation helper
    isComplete,
  };
};