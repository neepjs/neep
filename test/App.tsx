import { create, mName, mark, createElement } from '@neep/core';
import A from './components/A';

const App = create(() => <A name="啊" />);

export default mark(App, mName('App'));
