
import { Component } from '../../types';


export default function getComponents(
	...components: (Record<string, Component<any>> | undefined | null)[]
): Record<string, Component<any>>[] {
	return components.filter(Boolean) as Record<string, Component<any>>[];
}
