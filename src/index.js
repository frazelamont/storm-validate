import factory from './lib';

const init = (candidate, opts) => {
	let els;
	
	//if we think candidate is a form DOM node, pass it in an Array
	//otherwise convert candidate to an array of Nodes using it as a DOM query 
	if(typeof candidate !== 'string' && candidate.nodeName && candidate.nodeName === 'FORM') els = [candidate];
	else els = [].slice.call(document.querySelectorAll(candidate));
	
	// if(els.length === 1 && window.__validators__ && window.__validators__[els[0]]) return window.__validators__[els[0]];
	
	//return instance if one exists for candidate passed to init
	//if inititialised using StormVaidation.init({sel}) the instance already exists thanks to auto-init
	//but reference may be wanted for invoking API methods
	//also for repeat initialisations
	return window.__validators__ = Object.assign({}, window.__validators__, els.reduce((acc, el) => {
			if(el.hasAttribute('novalidate')) return acc;
			acc[el] = Object.create(factory(el, opts));
			el.setAttribute('novalidate', 'novalidate');
			return  acc;
		}, {}));
};

//Auto-initialise
{ 
	[].slice.call(document.querySelectorAll('form'))
		.forEach(form => { 
			if(form.querySelector('[data-val=true]') && !form.hasAttribute('novalidate')) init(form);
		});
}

export default { init };