// The real data files, parsed once, for tests. Tests use the delivered data, not invented samples:
// the files hold the cases that the brief leaves open (docs/SPEC.md, "What the mock data holds").

import rawV1 from '../../data/v1.json'
import rawV2 from '../../data/v2.json'
import rawV3 from '../../data/v3.json'
import { parseDocument } from './parseDocument'

export const v1 = parseDocument(rawV1)
export const v2 = parseDocument(rawV2)
export const v3 = parseDocument(rawV3)
