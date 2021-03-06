// setup
import { setup, Context, Actor, Movie } from '../../setup';

// models
import { DeliveryItemListingResponse } from '../../../../lib';

// tests
describe('Pagination', () => {

  var context = new Context();
  setup(context);

  var type: string = 'movie';
  var response: DeliveryItemListingResponse<Movie>;

  beforeAll((done) => {
    context.deliveryClient.items<Movie>()
      .type(type)
      .limitParameter(5)
      .skipParameter(1)
      .get()
      .subscribe(r => {
        response = r as DeliveryItemListingResponse<Movie>;
        done();
      });
  });

  it(`pagination should be defined`, () => {
    expect(response.pagination).toBeDefined();
  });

  it(`check count`, () => {
    expect(response.pagination.count).toEqual(5);
  });

  it(`check limit`, () => {
    expect(response.pagination.limit).toEqual(5);
  });

  it(`check skip`, () => {
    expect(response.pagination.skip).toEqual(1);
  });

  it(`check pagination count`, () => {
    expect(response.pagination.next_page).toEqual('');
  });
});

