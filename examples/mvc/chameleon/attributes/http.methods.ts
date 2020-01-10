import { Delete, Get, Post, Put } from 'lib-http';
export const HttpPost = (): MethodDecorator => Post(null);
export const HttpGet = (): MethodDecorator => Get(null);
export const HttpPut = (): MethodDecorator => Put(null);
export const HttpDelete = (): MethodDecorator => Delete(null);
