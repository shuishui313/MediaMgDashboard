import { AuditLogListDto, AuditLogListRequestDto } from './AppDtos';
import ApiClient from './ApiClient';

const ListLogs = (request: AuditLogListRequestDto): Promise<AuditLogListDto> =>
  ApiClient.invokeMethod<AuditLogListDto>('Api', 'AuditManager', 'ListLogs', request);

export default { ListLogs };
