/**
 * Org Limits Dashboard
 *
 * Copyright (c) 2026 Jyotishko Roy (https://orcid.org/0009-0000-2837-4731)
 * Licensed under the MIT License - see LICENSE file in the project root.
 */
public with sharing class OLD_AppController {

    public class Info {
        @AuraEnabled public String version;
        @AuraEnabled public String apiVersion;
        @AuraEnabled public Boolean sandbox;
        @AuraEnabled public String orgId;
        @AuraEnabled public String userId;
        @AuraEnabled public String username;
    }

    @AuraEnabled(cacheable=true)
    public static Info getInfo() {
        Info i = new Info();
        i.version = '0.1.0';
        i.apiVersion = '55.0';
        i.sandbox = [SELECT IsSandbox FROM Organization LIMIT 1].IsSandbox;
        i.orgId = UserInfo.getOrganizationId();
        i.userId = UserInfo.getUserId();
        i.username = UserInfo.getUserName();
        return i;
    }
}
