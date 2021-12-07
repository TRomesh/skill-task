import { apiFetchSucceeded } from 'store/actions';
import { DataPoint } from 'store/reducers';
import store from 'store';

import consumer from './consumer';

// Moved this subscription to the Home component's useEffect life ccle hook

// consumer.subscriptions.create(
//   { channel: 'DownstreamChannel' },
//   {
//     received(data: DataPoint) {
//       store.dispatch(apiFetchSucceeded('dataPoints', [data]));
//     },
//   }
// );
