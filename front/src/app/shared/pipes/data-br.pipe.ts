import { Pipe, PipeTransform } from '@angular/core';
import { formatarData } from '../../core/datas';

/** {{ ferias.data_inicio | dataBr }}  ->  15/12/2026 */
@Pipe({ name: 'dataBr' })
export class DataBrPipe implements PipeTransform {
  transform(valor?: string | null): string { return formatarData(valor); }
}
