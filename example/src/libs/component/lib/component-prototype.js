// import inputPrototype from './input-prototype';
import { 
	h,
	extractGroups,
	chooseRealtimeEvent,
	extractErrorMessage,
	validationReducer,
	removeUnvalidatedGroups
} from './utils';

export default {
	init() {
		//prevent browser validation
		this.form.setAttribute('novalidate', 'novalidate');

		//delete me please
		this.inputs = Array.from(this.form.querySelectorAll('input:not([type=submit]), textarea, select'));

		this.groups = removeUnvalidatedGroups(this.inputs.reduce(extractGroups, {}));

		this.initListeners();
		

		console.log(this.groups);

		/*

		1. ref. <input data-rule-minlength="2" data-rule-maxlength="4" data-msg-minlength="At least two chars" data-msg-maxlength="At most fours chars">


		2. ref. https://jqueryvalidation.org/files/demo/
		
		3. ref. Constraint validation API
		Validation-repated attributes
			- pattern, regex, 'The value must match the pattern'
			- min, number, 'The value must be greater than or equal to the value.'
			- max, number, 'The value must be less than or equal to the value',
			- required, none, 'There must be a value',
			- maxlength, int length, 'The number of characters (code points) must not exceed the value of the attribute.' 

		4. ref. https://github.com/aspnet/jquery-validation-unobtrusive/blob/master/src/jquery.validate.unobtrusive.js

		*/

		//validate whole form

		return this;
	},
	initListeners(){
		this.form.addEventListener('submit', e => {
			e.preventDefault();
			this.clearErrors();
			if(this.setValidityState()) this.form.submit();
			else this.renderErrors(), this.initRealtimeValidation();
		});

		this.form.addEventListener('reset', e => { this.clearErrors(); });
	},
	initRealtimeValidation(){
		let handler = function(e) {
				let group = e.target.getAttribute('name');
				if(this.groups[group].errorDOM) this.removeError(group);
				let validityState = this.setGroupValidityState(group);
				if(!validityState) this.renderError(group);
			}.bind(this);

		//map/over groups instead
		this.inputs.forEach(input => {
			let ev = chooseRealtimeEvent(input);
			input.addEventListener(ev, handler);
		});
	},
	setGroupValidityState(group){
		this.groups[group] = Object.assign({}, 
								this.groups[group],
								{ valid: true, errorMessages: [] }, //reset validity and errorMessagesa
								this.groups[group].validators.reduce(validationReducer(this.groups[group]), true));
		return this.groups[group].valid;
	},
	setValidityState(){
		let numErrors = 0;
		for(let group in this.groups){
			this.setGroupValidityState(group);
			!this.groups[group].valid && ++numErrors;
		}
		return numErrors === 0;
	},
	clearErrors(){
		for(let group in this.groups){
			if(this.groups[group].errorDOM) this.removeError(group);
		}
	},
	removeError(group){
		this.groups[group].errorDOM.parentNode.removeChild(this.groups[group].errorDOM);
		this.groups[group].fields.forEach(field => { field.removeAttribute('aria-invalid'); });//or should i set this to false if field passes validation?
		delete this.groups[group].errorDOM;
	},
	renderErrors(){
		//support for inline and error list?
		for(let group in this.groups){
			if(!this.groups[group].valid) this.renderError(group);
		}
	},
	renderError(group){
		this.groups[group].errorDOM = this.groups[group]
											.fields[this.groups[group].fields.length-1]
											.parentNode
											.appendChild(h('div', { class: 'error' }, this.groups[group].errorMessages[0]));
		
		//set aria-invalid on invalid inputs
		this.groups[group].fields.forEach(field => { field.setAttribute('aria-invalid', 'true'); });
	},
	addMethod(name, fn, message){
		this.groups.validators.push(fn);
		//extend messages
	}
};