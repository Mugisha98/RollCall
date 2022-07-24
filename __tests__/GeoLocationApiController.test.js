const getLocationApiController = require("../controllers/GeoLocationApiController");


test('Getting coordinates from KEA GBG address', async () => {
    //arrange
    const keaAddress = "Guldbergsgade 29N, 2200 København N";

    //act
    const coordinates = await getLocationApiController.getCoordinates(keaAddress);

    //assert
    expect(coordinates.data[0].latitude).toBe(55.694696);
    expect(coordinates.data[0].longitude).toBe(12.547292);
  });