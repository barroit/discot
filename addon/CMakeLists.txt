cmake_minimum_required(VERSION 3.15)

set(CMAKE_C_STANDARD 17)
set(CMAKE_C_EXTENSIONS true)
set(CMAKE_C_STANDARD_REQUIRED ON)

add_compile_definitions(-DNAPI_VERSION=10)

project(discot C)

file(GLOB src *.c)

add_library(${PROJECT_NAME} SHARED ${src} ${CMAKE_JS_SRC})
set_target_properties(${PROJECT_NAME} PROPERTIES PREFIX "" SUFFIX .node)
target_include_directories(${PROJECT_NAME} PRIVATE ${CMAKE_JS_INC} include)
target_link_libraries(${PROJECT_NAME} PRIVATE ${CMAKE_JS_LIB})
