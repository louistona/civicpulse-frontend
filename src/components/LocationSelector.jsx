import { useLocationData } from '../hooks/useLocationData';

/**
 * Reusable cascading location selector
 * Used in both citizen and official signup forms
 */
export default function LocationSelector({ onChange, errors = {}, clearError }) {
  const {
    districts, sectors, cells,
    selectedDistrict, selectedSector, selectedCell, village,
    handleDistrictChange, handleSectorChange, handleCellChange,
    setVillage,
    loadingDistricts, loadingSectors, loadingCells,
  } = useLocationData();

  const handleDistrict = (e) => {
    handleDistrictChange(e.target.value);
    clearError?.('district_id');
    onChange?.({ district_id: e.target.value, sector_id: '', cell_id: '', village: '' });
  };

  const handleSector = (e) => {
    handleSectorChange(e.target.value);
    clearError?.('sector_id');
    onChange?.({ district_id: selectedDistrict, sector_id: e.target.value, cell_id: '', village: '' });
  };

  const handleCell = (e) => {
    handleCellChange(e.target.value);
    clearError?.('cell_id');
    onChange?.({ district_id: selectedDistrict, sector_id: selectedSector, cell_id: e.target.value, village });
  };

  const handleVillage = (e) => {
    setVillage(e.target.value);
    onChange?.({ district_id: selectedDistrict, sector_id: selectedSector, cell_id: selectedCell, village: e.target.value });
  };

  const selectClass = (hasError) =>
    `w-full border rounded-lg px-3 py-2.5 text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-primary
    ${hasError ? 'border-danger' : 'border-border'}`;

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-text-main text-sm">Your Location in Kigali</h3>

      {/* District */}
      <div>
        <label className="block text-sm font-medium text-text-main mb-1">
          District <span className="text-danger">*</span>
        </label>
        <select value={selectedDistrict} onChange={handleDistrict}
          className={selectClass(errors.district_id)}
          disabled={loadingDistricts}>
          <option value="">{loadingDistricts ? 'Loading…' : 'Select district'}</option>
          {districts.map(d => (
            <option key={d.district_id} value={d.district_id}>{d.name}</option>
          ))}
        </select>
        {errors.district_id && <p className="text-danger text-xs mt-1">{errors.district_id}</p>}
      </div>

      {/* Sector */}
      <div>
        <label className="block text-sm font-medium text-text-main mb-1">
          Sector <span className="text-danger">*</span>
        </label>
        <select value={selectedSector} onChange={handleSector}
          className={selectClass(errors.sector_id)}
          disabled={!selectedDistrict || loadingSectors}>
          <option value="">
            {!selectedDistrict ? 'Select district first'
              : loadingSectors ? 'Loading…'
              : 'Select sector'}
          </option>
          {sectors.map(s => (
            <option key={s.sector_id} value={s.sector_id}>{s.name}</option>
          ))}
        </select>
        {errors.sector_id && <p className="text-danger text-xs mt-1">{errors.sector_id}</p>}
      </div>

      {/* Cell */}
      <div>
        <label className="block text-sm font-medium text-text-main mb-1">
          Cell <span className="text-danger">*</span>
        </label>
        <select value={selectedCell} onChange={handleCell}
          className={selectClass(errors.cell_id)}
          disabled={!selectedSector || loadingCells}>
          <option value="">
            {!selectedSector ? 'Select sector first'
              : loadingCells ? 'Loading…'
              : 'Select cell'}
          </option>
          {cells.map(c => (
            <option key={c.cell_id} value={c.cell_id}>{c.name}</option>
          ))}
        </select>
        {errors.cell_id && <p className="text-danger text-xs mt-1">{errors.cell_id}</p>}
      </div>

      {/* Village (optional) */}
      <div>
        <label className="block text-sm font-medium text-text-main mb-1">
          Village <span className="text-text-muted font-normal">(optional)</span>
        </label>
        <input type="text" value={village} onChange={handleVillage}
          placeholder="e.g. Kagugu"
          className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
    </div>
  );
}