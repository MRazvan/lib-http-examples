import {
  ApiAttributeData,
  ControllerAttributeData,
  ControllerScanner,
  HAS_BODY_PARAMS,
  HAS_HEADER_PARAMS,
  HAS_QUERY_PARAMS,
  ParamDataDTO,
  ParamSource
} from '@mrazvan/lib-http';
import { LogFactory } from 'lib-host';
import { MethodData, ParameterData, ReflectHelper } from 'lib-reflect';
import { head, isNil } from 'lodash';

const invalidMethodNames = ['get', 'post', 'put', 'delete']; // etc

// We just 'simulate' Controller / Api decorators and still use existing functionality
//    it is easier than writing the full scanner
export class ConventionRouteScanner extends ControllerScanner {
  public addClass(controller: Function): void {
    const log = this.server.container.get<LogFactory>(LogFactory).createLog('ConventionRouteScanner');
    const classData = ReflectHelper.getOrCreateClassData(controller);
    classData.build();

    // Check to see if the class name matches what we require (<X>Controller)
    if (!classData.name.startsWith('Api')) {
      throw new Error(`Invalid controller definition ${classData.name}. Controllers must start with 'Api'.`);
    }

    let foundApiMethod = false;
    // Check all the methods and create the 'API' attributes needed
    classData.methods.forEach((m: MethodData) => {
      // Private method
      if (m.name.startsWith('_') || m.name === 'constructor') {
        return;
      }
      // Skip this method, it is decorated with NoAction
      // //////////////////////////////////////////////
      // ////// METHOD API ATTRIBUTE CREATION /////////
      // //////////////////////////////////////////////
      let route = m.name.toLowerCase();
      if (invalidMethodNames.includes(route)) {
        throw new Error(`Invalid method name for an API ${classData.name}.${m.name}`);
      }

      // For MVC by default the call's go to the 'Index' action
      if (route === 'default') {
        route = '/';
      }
      // Finally add the api attribute to the method
      let apiType = head(m.getAttributesOfType<ApiAttributeData>(ApiAttributeData) || []);
      if (isNil(apiType)) {
        if (route === '/') {
          apiType = new ApiAttributeData({ type: 'GET' });
        } else if (route.startsWith('get')) {
          apiType = new ApiAttributeData({ type: 'GET' });
          route = route.substr(3);
        } else if (route.startsWith('post')) {
          apiType = new ApiAttributeData({ type: 'POST', path: route });
          route = route.substr(4);
        }
        // etc
        if (!isNil(apiType)) {
          m.attributesData.push(apiType);
        }
      }
      // No route created for this method
      if (isNil(apiType)) {
        return;
      }
      apiType.path = route;
      // //////////////////////////////////////////////
      // /////// METHOD PARAMETER DECORATION //////////
      // //////////////////////////////////////////////
      foundApiMethod = true;
      m.parameters.forEach((param: ParameterData) => {
        // Check to see if we need to add any attribute
        const paramDTO = head(param.getAttributesOfType<ParamDataDTO>(ParamDataDTO));
        if (!isNil(paramDTO)) {
          // This parameter is already decorated with an attribute from the base http lib
          return;
        }
        param.target = Object;
        if (param.name.startsWith('q_')) {
          m.tags[HAS_QUERY_PARAMS] = true;
          m.attributesData.push(
            new ParamDataDTO({ idx: param.idx, name: param.name.substr(2), source: ParamSource.Query })
          );
        } else if (param.name.startsWith('h_')) {
          m.tags[HAS_HEADER_PARAMS] = true;
          m.attributesData.push(
            new ParamDataDTO({ idx: param.idx, name: param.name.substr(2), source: ParamSource.Header })
          );
        } else if (param.name.startsWith('b_')) {
          m.tags[HAS_BODY_PARAMS] = true;
          m.attributesData.push(
            new ParamDataDTO({ idx: param.idx, name: param.name.substr(2), source: ParamSource.Body })
          );
        }
      });
    });
    if (foundApiMethod) {
      // //////////////////////////////////////////////
      // //// CONTROLLER API ATTRIBUTE CREATION ///////
      // //////////////////////////////////////////////
      // Create the controller api attribute
      classData.attributesData.push(
        new ControllerAttributeData({
          path: classData.name.substr(3).toLowerCase()
        })
      );
      // Finally register the class
      this.activations.register(controller);
    } else {
      log.warn(`Controller ${classData.name} does not have any api's exposed. It will not be hosted.`);
    }
  }
}
