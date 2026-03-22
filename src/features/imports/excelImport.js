import * as XLSX from "xlsx";
import { useSystemStore } from "../../store/systemStore";

export function importExcel(file) {
  const reader = new FileReader();

  reader.onload = (e) => {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: "array" });

    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    const addMember = useSystemStore.getState().addMember;

    rows.forEach((row) => {
      if (row.name) addMember(row.name);
    });
  };

  reader.readAsArrayBuffer(file);
}