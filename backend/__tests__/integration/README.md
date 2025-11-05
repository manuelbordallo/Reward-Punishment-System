# API Integration Tests

This directory contains comprehensive integration tests for all API endpoints in the Reward-Punishment System backend.

## Test Files

### 1. `api.integration.test.js`
- **Purpose**: Main integration test suite covering all API endpoints
- **Coverage**: 
  - Health check endpoint
  - API root endpoint
  - Basic CRUD operations for all entities
  - Error handling scenarios
  - Data cleanup

### 2. `person-endpoints.integration.test.js`
- **Purpose**: Detailed testing of person management endpoints
- **Coverage**:
  - Person CRUD operations (Create, Read, Update, Delete)
  - Name validation and uniqueness constraints
  - Search functionality
  - Statistics endpoints
  - Edge cases and error handling

### 3. `reward-punishment-endpoints.integration.test.js`
- **Purpose**: Comprehensive testing of reward and punishment endpoints
- **Coverage**:
  - Reward CRUD operations with positive value validation
  - Punishment CRUD operations with negative value validation
  - Statistics and analytics endpoints
  - Search and filtering functionality
  - Value range queries
  - Severity classification (punishments)

### 4. `assignment-endpoints.integration.test.js`
- **Purpose**: Testing assignment creation and management
- **Coverage**:
  - Single and multiple assignment creation
  - Assignment retrieval and filtering
  - Date range queries
  - Statistics and summaries
  - Validation and error handling
  - Edge cases (duplicate assignments, large batches)

### 5. `score-endpoints.integration.test.js`
- **Purpose**: Testing score calculation and reporting endpoints
- **Coverage**:
  - Total score calculations
  - Weekly score calculations
  - Score statistics and analytics
  - Person score trends
  - Score comparisons between persons
  - Real-time score updates after assignments
  - Current week information

## Test Requirements Coverage

The integration tests cover all requirements specified in the task:

### Requirements 1.1-1.4 (Person Management)
- ✅ Create persons with unique names
- ✅ List all persons
- ✅ Edit person names
- ✅ Delete persons
- ✅ Name validation (non-empty, unique)

### Requirements 2.1-2.4 (Reward Management)
- ✅ Create rewards with positive values
- ✅ List all rewards
- ✅ Edit reward names and values
- ✅ Delete rewards
- ✅ Positive value validation

### Requirements 3.1-3.4 (Punishment Management)
- ✅ Create punishments with negative values
- ✅ List all punishments
- ✅ Edit punishment names and values
- ✅ Delete punishments
- ✅ Negative value validation

### Requirements 4.1-4.5 (Assignment Management)
- ✅ Assign rewards/punishments to persons
- ✅ Multiple person assignments
- ✅ Assignment history tracking
- ✅ Assignment deletion
- ✅ Date/time recording

### Requirements 5.1-5.5 (Total Scores)
- ✅ Automatic score calculation
- ✅ Real-time score updates
- ✅ Score rssetta e daor larged fudincl are nsiderationsformance cos
- Perse causealistic  with re coveredts areinll API endporios
- Ave scenanegatie and positiv both nclude- Tests ion
n isolatid can run ipendent anindee is t suittes Each onment
-se/envir databaest tratee a sepasts us
- Tetes
d

## Nosatisfiements  require ✅ Allcefully
-rahandled gscenarios or  ✅ All erre
-accuratlculations  All caorced
- ✅s enfation rule ✅ All validly
-ng correctons worki operatill CRUD ✅ Ald see:
-, you shou passsts all te
When
t Resultspected Tes## Exions

cal calculat- Statistithms
lgoriRanking aic
- ng logerilt fikly
- Weecyn accuratiocore calcula
- SstingTeLogic ## Business 

#tency consis
- Data operationsnt Concurredata sets
-ge g
- Larlue testin va- Boundaryg
Testin Case ### Edge

d requests
- Malformeations violaint
- Constrngurce handli resostenton-exi Nion
-data validat Invalid 
- Testingandling### Error Hs

ipshata relation
- Proper dculationsd cals anul retrievalssfes
- Succed updatanation ata crelid ding
- Vath Test## Happy Parios

#st Scena

## Tests.js
```-tentegration run-i`bash
nodets Only
``ration Testeg### Run Ine
```

boserion --vratttern=integathPa --testPm test --```bash
npOutput
erbose  Vwithun 

### R```.test.js
tiongrateendpoints.inion/person-__/integratt -- __testsesm tsh
np
```bac Test Fileecifi
### Run Spn
```
rationtegtern=iestPathPat-- --ttest npm ```bash
ion Tests
ll Integrat Run Asts

###he Te# Running t

#t scenariosful tesmeaning: Uses stic Data***Realih other
- *ac with efere't interdonts Tessolation**: ion
- **Ipleter comaft data testemoves : RCleanup**tests
- **e running fort data be tesreates*: Cp*- **Setuncludes:
file i
Each test ment
nageMa Data 

## Testre isolationscoy eekl ✅ Wes
- updateeklyomatic w
- ✅ Autplayge disante rWeek daring
- ✅ ek filte weurrent- ✅ Cn
tiocore calcula Weekly ss)
- ✅eekly Score6.5 (W 6.1-ntsquireme Resplay

###eakdown dicore br
- ✅ S on changescalculationcore re Sanking
- ✅