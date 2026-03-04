@IsTest
private class OLD_AppControllerTest {
    @IsTest
    static void testInfo() {
        Test.startTest();
        OLD_AppController.Info i = OLD_AppController.getInfo();
        Test.stopTest();

        System.assertEquals('0.1.0', i.version);
        System.assertNotEquals(null, i.orgId);
        System.assertNotEquals(null, i.userId);
    }
}
