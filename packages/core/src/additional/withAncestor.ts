import { ComponentEntity, RenderComponent, StandardComponent } from '../types';
import { withParent } from '../auxiliary';
import { createWith } from '../extends';

const withAncestor: {
	<C extends StandardComponent<any, any, any> | RenderComponent<any, any, any>>(
		component: C,
		depth?: number,
	): ComponentEntity<C, any> | undefined;
} = createWith({
	name: 'withAncestor',
	create: () => withParent(),
	exec(entity, _, component, depth = 0) {
		for (let d = depth + 1; entity && d > 0; d--) {
			if (entity.component === component) {
				return entity;
			}
			entity = entity.parent;
		}
	},
});
export default withAncestor;
