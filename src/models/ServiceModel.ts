import { DataModelsType } from "@rms/models/CommonModel";
import ServiceActionModel from "./ServiceActionModel";
import LoginInterface from "@rms/interfaces/LoginInterface";

type ServiceModel = {
  create?: (params: any) => Promise<ServiceActionModel<DataModelsType>>;
  delete?: (id: number) => Promise<ServiceActionModel<DataModelsType>>;
  login?: (params: LoginInterface) => Promise<ServiceActionModel<string>>;
  logout?: () => Promise<ServiceActionModel<string>>;
  update?: (
    id: number,
    params: any
  ) => Promise<ServiceActionModel<DataModelsType>>;
  get?: (id: number) => Promise<ServiceActionModel<DataModelsType | any>>;
  getAll?: (
    params?: any
  ) => Promise<ServiceActionModel<DataModelsType[] | any[]>>;
  uploadMeida?: (fromData: FormData) => Promise<ServiceActionModel<string>>;
  deleteMedia?: (path: string) => Promise<ServiceActionModel<any>>;
  getByWhereInclude?: (
    props: any
  ) => Promise<ServiceActionModel<DataModelsType[] | any[]>>;
};
export default ServiceModel;
