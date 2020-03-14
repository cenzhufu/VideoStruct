// import * as Enzyme from 'enzyme';
import sum from '../sum';
// import AttributeFilterPanel from '../src/AttributeFilterPanel';
beforeAll(() => console.log('1 - beforeAll'));
afterAll(() => console.log('1 - afterAll'));
beforeEach(() => console.log('1 - beforeEach'));
afterEach(() => console.log('1 - afterEach'));
test('', () => console.log('1 - test'));
describe('Scoped / Nested block', () => {
	beforeAll(() => console.log('2 - beforeAll'));
	afterAll(() => console.log('2 - afterAll'));
	beforeEach(() => console.log('2 - beforeEach'));
	afterEach(() => console.log('2 - afterEach'));
	test('', () => console.log('2 - test'));
});
test('add  a + b', () => {
	expect(sum(1, 4)).toBe(5);
});

// const setup = () => {
// 	// 模拟 props
// 	const props = {
// 		// Jest 提供的mock 函数
// 		onConfirm: jest.fn()
// 	};

// 	// 通过 enzyme 提供的 shallow(浅渲染) 创建组件
// 	const wrapper = Enzyme.shallow( <AttributeFilterPanel /> );
// 	return {
// 		wrapper
// 	};
// };

// import * as React from 'react';
// import Enzyme, { shallow } from 'enzyme';
// import AttributeFilterPanel from '../src/AttributeFilterPanel';
// import * as Adapter from 'enzyme-adapter-react-16'; //适应React-16

// Enzyme.configure({ adapter: new Adapter() });

// test('Link changes the class when hovered', () => {
// 	const component = renderer.create(
// 		<Link page="http://www.facebook.com" > Facebook < /Link>,
// 	);
// 	let tree = component.toJSON();
// 	expect(tree).toMatchSnapshot();

// 	// manually trigger the callback
// 	tree.props.onMouseEnter();
// 	// re-rendering
// 	tree = component.toJSON();
// 	expect(tree).toMatchSnapshot();

// 	// manually trigger the callback
// 	tree.props.onMouseLeave();
// 	// re-rendering
// 	tree = component.toJSON();
// 	expect(tree).toMatchSnapshot();
// });

// import React from 'react';
// import { mount } from 'enzyme';
// import renderer from 'react-test-renderer';

// import * as renderer from 'react-test-renderer';
// import AttributeFilterPanel from '../src/AttributeFilterPanel';
// import { shallow } from 'enzyme';

// const onChangeDate = function() {
// 	console.log('22222222222222');
// };
// it('renders correctly', () => {
// 	const tree = renderer
// 		.create(<AttributeFilterPanel onChangeDate={onChangeDate} />)
// 		.toJSON();
// 	expect(tree).toMatchSnapshot();
// });

// test('Jest-React-TypeScript 尝试运行', () => {
// 	const renderer = shallow(<div>hello world < /div>)
//   expect(renderer.text()).toEqual('hello world')
// })
