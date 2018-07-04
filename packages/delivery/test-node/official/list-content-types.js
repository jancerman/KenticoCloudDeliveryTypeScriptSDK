const assert = require('assert');
const KenticoCloud = require('../../_commonjs/lib');

const deliveryClient = new KenticoCloud.DeliveryClient({
    projectId: 'e391c776-9d1e-4e1a-8a5a-1c327c2586b6',
});

describe('#List content types', () => {

    let result;

    before((done) => {
        deliveryClient.types()
            .limitParameter(3)
            .getObservable()
            .subscribe(response => {
                result = response;
                done();
            });
    });

    it('Response should be of proper type', () => {
        assert.ok(result);
        assert.ok((result instanceof KenticoCloud.TypeResponses.DeliveryTypeListingResponse));
    });

    it('Response items should be of proper type', () => {
        assert.ok(result.types[0] instanceof KenticoCloud.ContentType);
    });

});



