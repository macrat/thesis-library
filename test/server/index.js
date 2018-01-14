import utils from './utils';
import thesis from './thesis';
import searchindex from './searchindex';


export default function() {
	describe('utils', utils);
	describe('thesis', thesis);
	describe('search index', searchindex);
}
