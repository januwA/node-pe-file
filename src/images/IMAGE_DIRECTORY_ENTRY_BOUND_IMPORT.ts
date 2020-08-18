import { PE_FILE } from "../node-pe-file";
import { IMAGE_DIRECTORY_ENTRY_BOUND_IMPORT_INDEX } from "../types";
import { RVA2FOA } from "../pe-tools";
import { PE_FILE_BASE } from "../PE_FILE_BASE";

export function CREATE_IMAGE_DIRECTORY_ENTRY_BOUND_IMPORT(
  pe: PE_FILE,
  data: Buffer
) {
  const bimportTable =
    pe.image_nt_headers.image_optional_header.DataDirectory[
      IMAGE_DIRECTORY_ENTRY_BOUND_IMPORT_INDEX
    ];

    console.log(bimportTable);
    

  let offset = RVA2FOA(pe, bimportTable.VirtualAddress);
  new IMAGE_DIRECTORY_ENTRY_BOUND_IMPORT(data, offset);
}

/**
 ```
 struct _IMAGE_DIRECTORY_ENTRY_BOUND_IMPORT {
  DWORD TimeDateStamp;
  WORD  OffsetModuleName
  WORD  NumberOfModuleForwarderRefs
};
 ```
 */
export class IMAGE_DIRECTORY_ENTRY_BOUND_IMPORT extends PE_FILE_BASE {
  constructor(data: Buffer, offset: number) {
    super(data, offset);
    console.log( offset.toString(16) );
    
  }
}
