import { Value } from '../types';
import { value } from '../auxiliary';
import { createUse } from '../extends';


const useValue: {
	(): Value<any>;
	<T>(fn: () => T): T;
	<T>(fn?: () => T): T | Value<any>;
} = createUse<any, [(() => any) | void]>({
	name: 'useValue',
	create: fn => typeof fn === 'function' ? fn() : value(undefined),
}) as any;
export default useValue;
