import { ApiAttributeData, ControllerAttributeData, ControllerScanner, ParamDataDTO } from 'lib-http';
import { MethodData, ParameterData, ReflectHelper } from 'lib-reflect';
import { head, isNil } from 'lodash';
import { ActionMethodDTO } from '../attributes/apis';
import { NO_ACTION } from '../attributes/no.action';
import { RouteDataDTO } from '../attributes/route';
import { getMethodParameterNames } from '../helpers/class.param.names';
import { MVCParamDTO, MVC_QUERY_OR_PARAM } from './param.interceptor';

// We just 'simulate' Controller / Api decorators and still use existing functionality
//    it is easier than writing the full scanner
export class MVCRouteScanner extends ControllerScanner {
  public addClass(controller: Function): void {
    const classData = ReflectHelper.getClass(controller);
    classData.build();

    // Check to see if the class name matches what we require (<X>Controller)
    if (!classData.name.endsWith('Controller')) {
      throw new Error(`Invalid controller definition ${classData.name}. Controllers must end in 'Controller'.`);
    }

    // //////////////////////////////////////////////
    // //// CONTROLLER API ATTRIBUTE CREATION ///////
    // //////////////////////////////////////////////
    // Create the controller api attribute
    classData.attributeData.push(
      new ControllerAttributeData({
        path: classData.name.substr(0, classData.name.indexOf('Controller')).toLowerCase()
      })
    );

    // Check all the methods and create the 'API' attributes needed
    classData.methods.forEach((m: MethodData) => {
      // Skip this method, it is decorated with NoAction
      if (m.tags[NO_ACTION]) {
        return;
      }

      // //////////////////////////////////////////////
      // ////// METHOD API ATTRIBUTE CREATION /////////
      // //////////////////////////////////////////////
      let route = m.name.toLowerCase();
      const routeAttribute = head(m.getAttributesOfType<RouteDataDTO>(RouteDataDTO) || []);
      if (!isNil(routeAttribute)) {
        route = routeAttribute.path;
      } else {
        const actionName = head(m.getAttributesOfType<ActionMethodDTO>(ActionMethodDTO) || []);
        if (!isNil(actionName)) {
          route = actionName.path;
        }
      }
      // For MVC by default the call's go to the 'Index' action
      if (route === 'index') {
        route = '/';
      }
      // Finally add the api attribute to the method
      let apiType = head(m.getAttributesOfType<ApiAttributeData>(ApiAttributeData) || []);
      if (isNil(apiType)) {
        apiType = new ApiAttributeData({ type: 'GET', path: route });
        m.attributesData.push(apiType);
      } else {
        apiType.path = route;
      }

      // //////////////////////////////////////////////
      // /////// METHOD PARAMETER DECORATION //////////
      // //////////////////////////////////////////////
      const paramNames = getMethodParameterNames(classData.target.prototype[m.name]);
      if (paramNames.length !== classData.target.prototype[m.name].length) {
        throw new Error(
          `Error scanning method parameters, there is a mismatch in length between the arguments of the method and what we scanned. SCANNED : (${paramNames.join(
            ','
          )})`
        );
      }

      m.parameters.forEach((param: ParameterData) => {
        // Check to see if we need to add any attribute
        const paramDTO = head(param.getAttributesOfType<ParamDataDTO>(ParamDataDTO));
        if (!isNil(paramDTO)) {
          // This parameter is already decorated with an attribute from the base http lib
          return;
        }
        param.target = Object;
        const name = paramNames[param.idx];
        m.tags[MVC_QUERY_OR_PARAM] = true;
        m.attributesData.push(new MVCParamDTO(name, param.idx));
      });
    });
    // Finally register the class
    this.activations.register(controller);
  }
}
