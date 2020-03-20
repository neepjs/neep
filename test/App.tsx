import { create, mName, mark } from '@neep/core';
import A from './components/A';

const App = create((props, context, { createElement }) => <A name="啊" />);

export default mark(App, mName('App'));
