import marker from './marker';
import query from './query';
import utils from './utils';
import searcher from './searcher';


export default function() {
	describe('Marker', marker);

	describe('Searcher', searcher);

	describe('utils', () => {
		describe('query', query);
		utils();
	});
}
