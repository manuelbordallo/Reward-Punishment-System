const request = require('supertest');
const express = require('express');

// Import routes and middleware directly
const apiRoutes = require('../../routes');
const { 
  createCorsMiddleware, 
  globalErrorHandler, 
  notFoundHandler,
  timeoutHandler
} = require('../../middleware');
const { logger, requestLogger } = require('../../utils/logger');

// Create test app without database dependencies
function createTestApp() {
  const app = express();

  // Request timeout middleware
  app.use(timeoutHandler(30000));

  // Request logging middleware  
  app.use(requestLogger);

  // CORS middleware
  app.use(createCorsMiddleware());

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Security headers middleware
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });

  // Basic health check endpoint
  app.get('/health', (req, res) => {
    res.json({ 
      status: 'OK', 
      message: 'Reward-Punishment API is running',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'test'
    });
  });

  // API routes
  app.use('/api', apiRoutes);

  // 404 handler for undefined routes
  app.use('*', notFoundHandler);

  // Global error handler (must be last)
  app.use(globalErrorHandler);

  return app;
}

describe('API Structure Integration Tests', () => {
  let app;

  beforeAll(() => {
    app = createTestApp();
  });

  describe('Health Check', () => {
    test('GET /health should return server status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toMatchObject({
        status: 'OK',
        message: 'Reward-Punishment API is running'
      });
      expect(response.body.timestamp).toBeDefined();
    });
  });

  describe('API Root', () => {
    test('GET /api should return API information', async () => {
      const response = await request(app)
        .get('/api')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Reward-Punishment System API',
        version: '1.0.0',
        endpoints: {
          persons: '/api/persons',
          rewards: '/api/rewards',
          punishments: '/api/punishments',
          assignments: '/api/assignments',
          scores: '/api/scores'
        }
      });
    });
  });

  describe('Endpoint Structure Tests', () => {
    test('POST /api/persons should have proper validation', async ( });
});;
 ;
    })(false)ccess).toBese.body.surespon  expect();

    expect(400    .
    tValidData)d(largeBu.sen')
        /personsapiost('/     .ppp)
   request(aait sponse = awre      const its
 limize to s not due long) butme tooation (nal validhould fais s Thi
      //    };
e
  e namt reasonablLarge bu// 00) peat(1'.re   name: 'Aa = {
     ValidDatlargeBut  const   > {
  , async () =imits' ldies withinst borge reque handle laShould  test('{
  ', () =>  Limitsuest Sizebe('Req

  descri);   });
  }se);
 ss).toBe(fal.succee.bodyponsct(resexpe
      
(400);    .expect=')
    ame    .send('n')
    rlencodedrm-uon/x-www-fo, 'applicatie'Typntent-('Co       .set')
 rsonsst('/api/pe    .po
    st(app)que = await reesponseonst r
      c => {, async ()ontent type'd cURL encodeould handle test('Sh
       });
e(false);
 toBccess)..body.suresponse expect(

     400);ect(.exp        }')
json"alid": "d('{"inv    .sen
    ')ation/jsonlic-Type', 'appentont     .set('C   )
pi/persons'   .post('/a)
      request(app = await response const> {
     ) = async (ntent type',ON co handle JSShould   test(') => {
 ', (pe Handlingnt Tye('Conte
  describ
  });

    });e=block');oBe('1; mod]).trotection'xss-pders['x-.heaect(response;
      exp'DENY').toBe(options'])ame-freaders['x-nse.hespoexpect(r
      sniff');]).toBe('noype-options'tent-trs['x-conse.headeonxpect(resp    e;

  t(200)pec .ex       ealth')
t('/h  .gepp)
       request(a awaitponse =nst res {
      cosync () => headers', ae securityhould includtest('S});

    d();
    ne).toBeDefirigin']ow-olll-aontros-caders['accesonse.he expect(resp   200);

  ct(expe       .alth')
 et('/he       .gapp)
 uest(ait reqse = awresponst   con => {
    sync ()headers', aoper CORS  pr includehould    test('S> {
ers', () =urity Headd SecS ane('COR
  describ  });
    });
;
e)falscess).toBe(ucse.body.spect(respon
      ex04);
  .expect(4t')
      en'/nonexist     .get(
   uest(app)eq= await rresponse onst > {
      c() =nc  asyeturn 404',hould r s/nonexistentET    test('G

 );
    });alse.toBe(fuccess)ponse.body.st(res     expec

 404);    .expect(')
    tentisnex/no .get('/api      uest(app)
 = await req response nst {
      co) => (', asyncurn 404ould retshent i/nonexist'GET /apest(
    tg', () => {r Handlin'Erro describe(});

 
      });e(false);
s).toBody.succesponse.b expect(res    ;

 t(400)pec  .ex     d')
 d-i/invalicores/persont('/api/s      .ge
  quest(app) = await reesponse    const r() => {
  nc asy, n error'validatioould return id shd-nvalirson/ies/pecori/sT /ap    test('GE  });

lse);
  ss).toBe(fady.succeesponse.bo    expect(r0);

  ct(40pe .ex
       d-id')alints/invnme'/api/assig .get(       app)
 request( = awaitsponseret      cons () => {
  asyncrror',n eatioeturn valid-id should rvalidts/inssignmenpi/a'GET /a test();

      }alse);
 ).toBe(fbody.successt(response.      expec

(400);    .expectd')
    alid-iishments/invet('/api/pun.g        )
uest(appreqnse = await espo rst  con   ) => {
 r', async (tion erron valida returldshoud alid-ihments/invpi/punis('GET /a  test
  );
se);
    }).toBe(falbody.successt(response.     expec;

 0)  .expect(40   id')
   lid-ards/invaapi/rewt('/.ge       st(app)
 t reque= awainse const respo
      > {) = async (r',idation erron vald returid shoulnvalid-pi/rewards/i /aETt('Gtes
    );
;
    }alse)toBe(fy.success).se.bodct(respon    expe;

  ect(400)     .exp  
 invalid-id')ns/rsoget('/api/pe)
        .uest(appait reqnse = aw respo      const=> {
nc () r', asyidation errourn valould retvalid-id shi/persons/inst('GET /ap    te);

);
    }sefalBe(.touccess)y.se.bodrespons    expect(

  0);  .expect(40
      
        })ds: [1]    personI     emId: 1,
  it
         'invalid',pe:  itemTy    
       .send({')
      ntsme/assignost('/api.p      
  pp)st(aque await rense =st respo  con
     errorlidation return va- shouldem type  invalid itt with     // Tes => {
 async ()dation', ali proper vd haveulments shognssiPOST /api/a('    test  });

(false);
  uccess).toBedy.sponse.boect(res

      exp00);ct(4xpe     .ejected
   reould be shve value ositi P //lue: 5 }) 'Test', va({ name:    .send
    ')ntsshmei/punist('/ap.po        quest(app)
it re awaponse =  const res  error
  dation li varnuld retu shoata -h invalid dTest wit//    => {
     ()', asyncalidationoper v have prhoulds sishmentST /api/pun   test('PO });

 
   lse);).toBe(fay.successnse.bodt(respo expec;

     400)pect(exd
        .rejecteuld be  value sho // Negativee: -5 })alust', v'Teame: ({ nsend        .s')
rdi/rewaost('/ap       .p)
 t(app requesitponse = awaonst res    cerror
  dation return valiuld - shovalid data  with in// Test     
 > {c () =on', asyner validatid have propds shoular /api/rew('POST
    test
    });
ined();.toBeDefody.error)(response.b      expectlse);
faccess).toBe(onse.body.suesppect(r   ex);

   (400ectexp        .d({})
 .sen       ersons')
/api/p('      .postpp)
  request(ase = await st respon     conion error
 validatn returshould ody - mpty bst with e     // Te) => {
 