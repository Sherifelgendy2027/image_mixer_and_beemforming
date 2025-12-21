import React from "react";
import Slider from "./Slider";
import Label from "./Label";
import Select, { SelectItem } from "./Select";

function UnitCard({ unit, index, onUpdate, onRemove }) {
  return (
    <div className="unit-card">
      <div className="unit-header">
        <strong>Unit {index + 1}</strong>
        <button className="btn-sm btn-danger" onClick={() => onRemove(index)}>
          ×
        </button>
      </div>

      <div className="control-row">
        <Label>
          Freq (MHz):{" "}
          <span id={`lbl_frequency_${index}`}>{unit.frequency}</span>
        </Label>
        <Slider
          value={unit.frequency}
          onValueChange={(val) => onUpdate(index, "frequency", val)}
          min={1}
          max={30000}
        />
      </div>

      <div className="control-row">
        <Label>
          Elements: <span id={`lbl_elements_${index}`}>{unit.elements}</span>
        </Label>
        <Slider
          value={unit.elements}
          onValueChange={(val) => onUpdate(index, "elements", val)}
          min={1}
          max={128}
        />
      </div>

      <div className="control-row">
        <Label>
          Spacing (λ): <span id={`lbl_spacing_${index}`}>{unit.spacing}</span>
        </Label>
        <Slider
          value={unit.spacing}
          onValueChange={(val) => onUpdate(index, "spacing", val)}
          min={0.1}
          max={5.0}
          step={0.1}
        />
      </div>

      <div className="control-row">
        <Label>
          Steering (°):{" "}
          <span id={`lbl_steering_${index}`}>{unit.steering}</span>
        </Label>
        <Slider
          value={unit.steering}
          onValueChange={(val) => onUpdate(index, "steering", val)}
          min={-90}
          max={90}
        />
      </div>

      <div className="control-row">
        <Label>Type:</Label>
        <Select
          value={unit.type}
          onValueChange={(val) => onUpdate(index, "type", val)}
        >
          <SelectItem value="linear">Linear</SelectItem>
          <SelectItem value="curved">Curved</SelectItem>
        </Select>
      </div>

      <div
        className="control-row"
        style={{ display: unit.type === "linear" ? "none" : "block" }}
      >
        <Label>
          Curvature (rad):{" "}
          <span id={`lbl_curvature_${index}`}>{unit.curvature}</span>
        </Label>
        <Slider
          value={unit.curvature}
          onValueChange={(val) => onUpdate(index, "curvature", val)}
          min={0.1}
          max={6.2}
          step={0.1}
        />
      </div>

      <div className="control-row">
        <Label>
          Pos X: <span id={`lbl_x_pos_${index}`}>{unit.x_pos}</span>
        </Label>
        <Slider
          value={unit.x_pos}
          onValueChange={(val) => onUpdate(index, "x_pos", val)}
          min={-10}
          max={10}
          step={0.1}
        />
      </div>
      <div className="control-row">
        <Label>
          Pos Y: <span id={`lbl_y_pos_${index}`}>{unit.y_pos}</span>
        </Label>
        <Slider
          value={unit.y_pos}
          onValueChange={(val) => onUpdate(index, "y_pos", val)}
          min={-10}
          max={10}
          step={0.1}
        />
      </div>
    </div>
  );
}

export default UnitCard;
